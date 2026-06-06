import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare, Megaphone, Loader2, Send, Search } from 'lucide-react';
import ChatThread from '@/components/messaging/ChatThread';
import { useAllConversations } from '@/hooks/use-messages';
import { supabase } from '@/integrations/supabase/client';
import { ALL_PROGRAMS } from '@/lib/programs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export function AdminMessaging() {
  const { conversations, loading } = useAllConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const name = c.participant?.full_name?.toLowerCase() || '';
      const email = c.participant?.email?.toLowerCase() || '';
      return name.includes(q) || email.includes(q);
    });
  }, [conversations, query]);

  const selected = conversations.find((c) => c.id === selectedId);

  return (
    <Tabs defaultValue="inbox" className="space-y-4">
      <TabsList>
        <TabsTrigger value="inbox" className="gap-2">
          <MessageSquare className="h-4 w-4" /> Inbox
        </TabsTrigger>
        <TabsTrigger value="broadcast" className="gap-2">
          <Megaphone className="h-4 w-4" /> Broadcast
        </TabsTrigger>
      </TabsList>

      <TabsContent value="inbox">
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-[320px_1fr] h-[70vh]">
            {/* Conversation list */}
            <div className={cn(
              'border-r border-border flex flex-col bg-card',
              selectedId && 'hidden md:flex'
            )}>
              <div className="p-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-8 h-9"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : filtered.length === 0 ? (
                  <p className="p-8 text-center text-sm text-muted-foreground">
                    No conversations yet.
                  </p>
                ) : (
                  filtered.map((c) => {
                    const name = c.participant?.full_name || c.participant?.email || 'Unknown user';
                    const initials = name
                      .split(' ')
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedId(c.id)}
                        className={cn(
                          'w-full flex items-start gap-3 px-3 py-2.5 border-b border-border hover:bg-muted/50 text-left transition-colors',
                          selectedId === c.id && 'bg-muted'
                        )}
                      >
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium truncate">{name}</p>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {formatDistanceToNow(new Date(c.last_message_at), { addSuffix: false })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs text-muted-foreground truncate">
                              {c.last_message_preview || 'No messages yet'}
                            </p>
                            {!!c.unread_count && (
                              <Badge className="h-5 min-w-5 px-1.5 text-[10px]">
                                {c.unread_count}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Thread */}
            <div className={cn('flex flex-col', !selectedId && 'hidden md:flex')}>
              {selectedId && (
                <button
                  onClick={() => setSelectedId(null)}
                  className="md:hidden text-sm text-primary px-3 py-2 border-b border-border text-left"
                >
                  ← Back to conversations
                </button>
              )}
              <ChatThread
                conversationId={selectedId}
                viewerRole="admin"
                headerTitle={
                  selected
                    ? selected.participant?.full_name || selected.participant?.email || 'User'
                    : undefined
                }
                headerSubtitle={selected?.participant?.email || undefined}
                emptyState="Pick a conversation from the left to start chatting."
              />
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="broadcast">
        <BroadcastComposer />
      </TabsContent>
    </Tabs>
  );
}

function BroadcastComposer() {
  const [audience, setAudience] = useState<'all' | 'students' | 'program'>('all');
  const [program, setProgram] = useState<string>('');
  const [body, setBody] = useState('');
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [counting, setCounting] = useState(false);
  const [sending, setSending] = useState(false);

  const previewCount = async () => {
    setCounting(true);
    const params: any = {};
    if (audience === 'program') params.program = program;
    if (audience === 'students') params.audience = 'students';
    if (audience === 'all') params.audience = 'all';
    try {
      const { data, error } = await supabase.functions.invoke('broadcast-message', {
        body: { mode: 'count', ...params },
      });
      if (error) throw error;
      setRecipientCount(data?.count ?? 0);
    } catch (e: any) {
      toast.error(e.message || 'Failed to count recipients');
    } finally {
      setCounting(false);
    }
  };

  const sendBroadcast = async () => {
    if (!body.trim()) {
      toast.error('Message cannot be empty');
      return;
    }
    if (audience === 'program' && !program) {
      toast.error('Pick a program');
      return;
    }
    setSending(true);
    try {
      const params: any = { mode: 'send', body: body.trim() };
      if (audience === 'program') params.program = program;
      if (audience === 'students') params.audience = 'students';
      if (audience === 'all') params.audience = 'all';
      const { data, error } = await supabase.functions.invoke('broadcast-message', { body: params });
      if (error) throw error;
      toast.success(`Broadcast sent to ${data?.recipient_count ?? 0} user(s)`);
      setBody('');
      setRecipientCount(null);
    } catch (e: any) {
      toast.error(e.message || 'Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" /> Broadcast a message
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Audience</label>
            <Select value={audience} onValueChange={(v: any) => { setAudience(v); setRecipientCount(null); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All approved users</SelectItem>
                <SelectItem value="students">Students only</SelectItem>
                <SelectItem value="program">By program</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {audience === 'program' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Program</label>
              <Select value={program} onValueChange={(v) => { setProgram(v); setRecipientCount(null); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_PROGRAMS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Message</label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your announcement…"
            rows={5}
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground">
            {body.length}/2000 — recipients can reply directly in their inbox.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={previewCount} disabled={counting}>
            {counting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Preview recipients
          </Button>
          {recipientCount !== null && (
            <Badge variant="secondary">{recipientCount} recipient(s)</Badge>
          )}
          <div className="flex-1" />
          <Button onClick={sendBroadcast} disabled={sending || !body.trim()}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send broadcast
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AdminMessaging;