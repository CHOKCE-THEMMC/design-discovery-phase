import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Shield, User, Users, Crown, CheckCircle2, XCircle, Clock, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UserWithRole extends Profile {
  role?: string;
}

export function UsersManagement() {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for each profile
      const usersWithRoles: UserWithRole[] = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.user_id)
            .maybeSingle();

          return {
            ...profile,
            role: roleData?.role || 'user',
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string, userName: string) => {
    if (!isAdmin) {
      toast.error('Only admins can change user roles');
      return;
    }

    const oldRole = users.find(u => u.user_id === userId)?.role;

    try {
      // First, check if role exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole as Database['public']['Enums']['app_role'] })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ 
            user_id: userId, 
            role: newRole as Database['public']['Enums']['app_role']
          });

        if (error) throw error;
      }

      // If user is being promoted to admin or moderator, notify both parties
      if ((newRole === 'admin' || newRole === 'moderator') && oldRole !== newRole) {
        const roleTitle = newRole === 'admin' ? 'Administrator' : 'Moderator';
        const roleEmoji = newRole === 'admin' ? '👑' : '🛡️';
        
        // Notify the promoted user
        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title: `${roleEmoji} You are now a ${roleTitle}`,
            message: newRole === 'admin' 
              ? 'You have been granted administrator privileges. You now have access to the admin dashboard and can manage users, materials, and system settings.'
              : 'You have been granted moderator privileges. You can now review and approve materials submitted by lecturers.',
            type: 'role_change'
          });

        // Notify the current admin who made the change
        if (currentUser?.id) {
          await supabase
            .from('notifications')
            .insert({
              user_id: currentUser.id,
              title: `🔔 New ${roleTitle} Added`,
              message: `${userName} has been granted ${roleTitle.toLowerCase()} privileges.`,
              type: 'admin_notification'
            });
        }

        // Get all other admins and notify them
        const { data: adminRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin');

        if (adminRoles) {
          const otherAdmins = adminRoles.filter(
            a => a.user_id !== userId && a.user_id !== currentUser?.id
          );

          for (const admin of otherAdmins) {
            await supabase
              .from('notifications')
              .insert({
                user_id: admin.user_id,
                title: `🔔 New ${roleTitle} Added`,
                message: `${userName} has been granted ${roleTitle.toLowerCase()} privileges.`,
                type: 'admin_notification'
              });
          }
        }
      }

      toast.success('Role updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!isAdmin) {
      toast.error('Only admins can delete users');
      return;
    }

    try {
      // Delete user's notifications
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

      // Delete user's bookmarks
      await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId);

      // Delete user's viewing history
      await supabase
        .from('viewing_history')
        .delete()
        .eq('user_id', userId);

      // Delete user's role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Delete user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) throw profileError;

      toast.success(`User "${userName}" has been deleted`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user. Note: The auth user must be deleted from the backend.');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-primary/20 text-primary"><Crown className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-library-burgundy/20 text-library-burgundy"><Shield className="h-3 w-3 mr-1" />Moderator</Badge>;
      default:
        return <Badge variant="secondary"><User className="h-3 w-3 mr-1" />User</Badge>;
    }
  };

  const getApprovalBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminUsers = filteredUsers.filter(u => u.role === 'admin');
  const moderatorUsers = filteredUsers.filter(u => u.role === 'moderator');
  const regularUsers = filteredUsers.filter(u => u.role === 'user');

  const UserTable = ({ userList, title, icon: Icon }: { userList: UserWithRole[], title: string, icon: any }) => (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {title} ({userList.length})
      </h3>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
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
            ) : userList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              userList.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.full_name || ''}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <span className="font-medium">{user.full_name || 'Unknown'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email || 'N/A'}
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role || 'user')}</TableCell>
                  <TableCell>{getApprovalBadge(user.approval_status || 'pending')}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {isAdmin && user.user_id !== currentUser?.id && (
                      <div className="flex items-center justify-end gap-2">
                        <Select
                          value={user.role || 'user'}
                          onValueChange={(value) => handleRoleChange(user.user_id, value, user.full_name || 'User')}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{user.full_name || 'this user'}"? This action cannot be undone and will remove all their data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.user_id, user.full_name || 'User')}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users Management
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{users.length} Total Users</Badge>
            <Badge className="bg-primary/20 text-primary">{adminUsers.length} Admins</Badge>
          </div>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-1">
              <Crown className="h-4 w-4" />
              Admins
            </TabsTrigger>
            <TabsTrigger value="moderators" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Moderators
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {adminUsers.length > 0 && (
              <UserTable userList={adminUsers} title="Administrators" icon={Crown} />
            )}
            {moderatorUsers.length > 0 && (
              <UserTable userList={moderatorUsers} title="Moderators" icon={Shield} />
            )}
            <UserTable userList={regularUsers} title="Regular Users" icon={User} />
          </TabsContent>

          <TabsContent value="admins">
            <UserTable userList={adminUsers} title="Administrators" icon={Crown} />
          </TabsContent>

          <TabsContent value="moderators">
            <UserTable userList={moderatorUsers} title="Moderators" icon={Shield} />
          </TabsContent>

          <TabsContent value="users">
            <UserTable userList={regularUsers} title="Regular Users" icon={User} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
