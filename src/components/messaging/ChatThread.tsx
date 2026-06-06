import { useEffect, useRef, useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  useConversationMessages,
  sendMessage,
  markConversationRead,
  Message,
} from '@/hooks/use-messages';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format, isToday } from 'date-fns';

interface ChatThreadProps {
  conversationId: string | null;
  viewerRole: 'user' | 'admin';
  headerTitle?: string;
  headerSubtitle?: string;
  emptyState?: React.ReactNode;
}

export default function ChatThread({
  conversationId,
  viewerRole,
  headerTitle,
  headerSubtitle,
  emptyState,
}: ChatThreadProps) {
  const { user } = useAuth();
  const { messages, loading } = useConversationMessages(conversationId);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  // Mark read on open and on new messages
  useEffect(() => {
    if (conversationId) markConversationRead(conversationId, viewerRole);
  }, [conversationId, viewerRole, messages.length]);

  const handleSend = async () => {
    if (!conversationId || !user || !body.trim()) return;
    setSending(true);
    const result = await sendMessage(conversationId, user.id, viewerRole, body);
    setSending(false);
    if (!result.error) setBody('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground p-8 text-center">
        {emptyState || 'Select a conversation to start chatting'}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-muted/20">
      {(headerTitle || headerSubtitle) && (
        <div className="px-4 py-3 border-b border-border bg-card flex-shrink-0">
          {headerTitle && <p className="font-semibold text-foreground">{headerTitle}</p>}
          {headerSubtitle && (
            <p className="text-xs text-muted-foreground">{headerSubtitle}</p>
          )}
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} viewerRole={viewerRole} />)
        )}
      </div>

      <div className="border-t border-border bg-card p-3 flex items-end gap-2 flex-shrink-0">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          rows={1}
          className="resize-none min-h-[40px] max-h-32 flex-1"
          disabled={sending}
        />
        <Button onClick={handleSend} disabled={sending || !body.trim()} size="icon">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

function MessageBubble({ message, viewerRole }: { message: Message; viewerRole: 'user' | 'admin' }) {
  const isMine = message.sender_role === viewerRole;
  const time = new Date(message.created_at);
  const label = isToday(time) ? format(time, 'HH:mm') : format(time, 'MMM d, HH:mm');
  return (
    <div className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm',
          isMine
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-card border border-border text-foreground rounded-bl-sm'
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
        <p
          className={cn(
            'text-[10px] mt-1 text-right',
            isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {label}
          {isMine && message.read_at ? ' ✓✓' : isMine ? ' ✓' : ''}
        </p>
      </div>
    </div>
  );
}