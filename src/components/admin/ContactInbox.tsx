import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Mail, Loader2, ExternalLink, Check, Inbox } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export function ContactInbox() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setMessages(data as ContactMessage[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const markStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', id);
    if (error) {
      toast.error('Failed to update');
      return;
    }
    toast.success(`Marked as ${status}`);
    load();
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Inbox className="h-5 w-5 text-primary" /> Contact Inbox
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No contact messages yet.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {messages.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                className={cn(
                  'w-full text-left py-3 px-2 hover:bg-muted/50 transition-colors flex items-start gap-3',
                  m.status === 'new' && 'bg-primary/5'
                )}
              >
                <Mail className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate">
                      {m.name} <span className="text-muted-foreground">· {m.email}</span>
                    </p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm truncate">{m.subject}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.message}</p>
                </div>
                <Badge variant={m.status === 'new' ? 'default' : 'secondary'} className="shrink-0">
                  {m.status}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.subject}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-sm">
                  From <span className="font-medium">{selected.name}</span>{' '}
                  <a href={`mailto:${selected.email}`} className="text-primary hover:underline">
                    &lt;{selected.email}&gt;
                  </a>
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(selected.created_at).toLocaleString()}
                </p>
                <div className="bg-muted/50 rounded-md p-3 text-sm whitespace-pre-wrap">
                  {selected.message}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button asChild>
                    <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}>
                      <ExternalLink className="h-4 w-4 mr-2" /> Reply by email
                    </a>
                  </Button>
                  {selected.status !== 'resolved' && (
                    <Button variant="outline" onClick={() => markStatus(selected.id, 'resolved')}>
                      <Check className="h-4 w-4 mr-2" /> Mark resolved
                    </Button>
                  )}
                  {selected.status !== 'read' && selected.status !== 'resolved' && (
                    <Button variant="ghost" onClick={() => markStatus(selected.id, 'read')}>
                      Mark read
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default ContactInbox;