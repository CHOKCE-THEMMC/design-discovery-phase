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
import { UserCheck, UserX, Clock, User, CheckCircle2, XCircle } from 'lucide-react';
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
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ approval_status: status })
        .eq('user_id', userId);

      if (error) throw error;

      // Send notification to the user
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: status === 'approved' 
            ? '🎉 Account Approved!' 
            : '❌ Account Not Approved',
          message: status === 'approved'
            ? 'Your account has been approved. You now have full access to the DTI Library resources.'
            : 'Your account registration was not approved. Please contact administration for more information.',
          type: status === 'approved' ? 'approval' : 'rejection'
        });

      toast.success(`User ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      fetchPendingUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
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
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Registered</TableHead>
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
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium">{user.full_name || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {user.enrolled_program ? (
                        <Badge variant="secondary">{user.enrolled_program}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Not specified</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user.approval_status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApproval(user.user_id, 'approved', user.full_name || 'User')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleApproval(user.user_id, 'rejected', user.full_name || 'User')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
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
