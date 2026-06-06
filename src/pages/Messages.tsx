import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatThread from '@/components/messaging/ChatThread';
import { ensureMyConversation } from '@/hooks/use-messages';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, MessageCircle } from 'lucide-react';

export default function Messages() {
  const { user, isAdmin, loading, roleLoaded } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (isAdmin) {
      setInitializing(false);
      return;
    }
    ensureMyConversation(user.id).then((id) => {
      setConversationId(id);
      setInitializing(false);
    });
  }, [user, isAdmin]);

  if (loading || !roleLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-4 flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-bold">Messages</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Direct line to the DTI Library administrators. We typically reply within 24 hours.
        </p>
        <div className="border border-border rounded-lg overflow-hidden bg-card h-[70vh] flex flex-col">
          {initializing ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ChatThread
              conversationId={conversationId}
              viewerRole="user"
              headerTitle="DTI Library Admins"
              headerSubtitle="Usually replies within 24 hours"
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}