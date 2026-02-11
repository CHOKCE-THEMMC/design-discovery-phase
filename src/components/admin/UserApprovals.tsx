import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { UserCheck, Clock, User, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

interface PendingUser {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  enrolled_program: string | null;
  created_at: string;
  approval_status: string;
}

export function UserApprovals() {
  const { user: currentUser } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingUsers(data || []);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId: string, status: 'approved' | 'rejected', userName: string) => {
    if (processingIds.has(userId)) return;
    
    setProcessingIds(prev => new Set(prev).add(userId));
    
    try {
      // Update the profile approval status
      const { error } = await supabase
        .from('profiles')
        .update({ approval_status: status })
        .eq('user_id', userId);

      if (error) throw error;

      // Send notification to the user about their approval/rejection
      try {
        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title: status === 'approved' 
              ? '🎉 Account Approved!' 
              : '❌ Account Not Approved',
            message: status === 'approved'
              ? 'Your account has been approved! You now have full access to the DTI Library resources. Welcome aboard!'
              : 'Your account registration was not approved. Please contact administration for more information.',
            type: status === 'approved' ? 'approval' : 'rejection'
          });
      } catch (notifErr) {
        console.log('Notification insert failed (may be RLS):', notifErr);
      }

      // Notify the admin who performed the action
      if (currentUser?.id) {
        try {
          await supabase
            .from('notifications')
            .insert({
              user_id: currentUser.id,
              title: `🔔 User ${status === 'approved' ? 'Approved' : 'Rejected'}`,
              message: `${userName} has been ${status}.`,
              type: 'admin_notification'
            });
        } catch (notifErr) {
          console.log('Admin notification failed:', notifErr);
        }
      }

      toast.success(`User "${userName}" has been ${status}`);
      
      // Remove from local state immediately for responsive UI
      setPendingUsers(prev => prev.filter(u => u.user_id !== userId));
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            User Approvals
          </CardTitle>
          <Badge variant="outline">
            {pendingUsers.length} Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>User</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Program</TableHead>
                <TableHead className="hidden md:table-cell">Registered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : pendingUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                      <span>No pending approvals</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium block truncate">{user.full_name || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground sm:hidden block truncate">{user.email || 'N/A'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">
                      {user.email || 'N/A'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.enrolled_program ? (
                        <Badge variant="secondary" className="text-xs">{user.enrolled_program}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">Not specified</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user.approval_status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproval(user.user_id, 'approved', user.full_name || 'User')}
                          className="bg-green-600 hover:bg-green-700 text-white h-8 px-2 sm:px-3"
                          disabled={processingIds.has(user.user_id)}
                        >
                          <CheckCircle2 className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Approve</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleApproval(user.user_id, 'rejected', user.full_name || 'User')}
                          className="h-8 px-2 sm:px-3"
                          disabled={processingIds.has(user.user_id)}
                        >
                          <XCircle className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Reject</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
