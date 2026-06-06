import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: 'user' | 'admin';
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  last_message_at: string;
  last_message_preview: string | null;
  created_at: string;
  unread_count?: number;
  participant?: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

/** Get or create the current user's conversation. */
export async function ensureMyConversation(userId: string): Promise<string | null> {
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId })
    .select('id')
    .single();
  if (error) {
    console.error('ensureMyConversation', error);
    return null;
  }
  return data.id;
}

/** Hook for a single conversation thread (used by both user and admin). */
export function useConversationMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (!error && data) setMessages(data as Message[]);
    setLoading(false);
  }, [conversationId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === (payload.new as Message).id)) return prev;
            return [...prev, payload.new as Message];
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return { messages, loading, reload: load };
}

/** Hook for admin: list every conversation with participant profile + unread. */
export function useAllConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const meRef = useRef(user?.id);
  meRef.current = user?.id;

  const load = useCallback(async () => {
    setLoading(true);
    const { data: convs, error } = await supabase
      .from('conversations')
      .select('*')
      .order('last_message_at', { ascending: false });
    if (error || !convs) {
      setLoading(false);
      return;
    }
    const userIds = convs.map((c) => c.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name, email, avatar_url')
      .in('user_id', userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000']);
    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

    // Unread counts (messages from user not read)
    const { data: unreadRows } = await supabase
      .from('messages')
      .select('conversation_id')
      .is('read_at', null)
      .eq('sender_role', 'user');
    const unreadMap = new Map<string, number>();
    (unreadRows || []).forEach((r: any) => {
      unreadMap.set(r.conversation_id, (unreadMap.get(r.conversation_id) || 0) + 1);
    });

    setConversations(
      convs.map((c: any) => ({
        ...c,
        participant: profileMap.get(c.user_id) || undefined,
        unread_count: unreadMap.get(c.id) || 0,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel('all-conversations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => load())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  return { conversations, loading, reload: load };
}

/** Send a message in a conversation. Updates conversation preview. */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderRole: 'user' | 'admin',
  body: string
) {
  const trimmed = body.trim();
  if (!trimmed) return { error: new Error('Empty message') };
  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: senderId,
    sender_role: senderRole,
    body: trimmed,
  });
  if (error) return { error };
  await supabase
    .from('conversations')
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: trimmed.slice(0, 120),
    })
    .eq('id', conversationId);
  return { error: null };
}

/** Mark messages as read (those from the other party). */
export async function markConversationRead(
  conversationId: string,
  viewerRole: 'user' | 'admin'
) {
  const otherRole = viewerRole === 'user' ? 'admin' : 'user';
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('sender_role', otherRole)
    .is('read_at', null);
}

/** Unread count for current user (used in navbar badge). */
export function useUnreadMessageCount() {
  const { user, isAdmin } = useAuth();
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    if (!user) {
      setCount(0);
      return;
    }
    if (isAdmin) {
      const { count: c } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .is('read_at', null)
        .eq('sender_role', 'user');
      setCount(c || 0);
    } else {
      // find my conversation
      const { data: conv } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!conv) {
        setCount(0);
        return;
      }
      const { count: c } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .is('read_at', null)
        .eq('sender_role', 'admin');
      setCount(c || 0);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('unread-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, load]);

  return count;
}