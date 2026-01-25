import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireModerator?: boolean;
  requireApproval?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireModerator = false,
  requireApproval = true
}: ProtectedRouteProps) {
  const { user, loading, isAdmin, isModerator, isApproved, isPending, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Show pending approval message for non-admin users
  if (requireApproval && isPending && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
            <CardDescription>
              Your account is awaiting approval from an administrator. You will receive a notification once your account is approved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>This usually takes 24-48 hours. If you believe this is an error, please contact the administration.</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
              <Button 
                className="flex-1"
                onClick={() => window.location.reload()}
              >
                Check Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireModerator && !isModerator) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
