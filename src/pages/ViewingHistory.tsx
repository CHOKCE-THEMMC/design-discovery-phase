import { History, Trash2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MaterialCard from "@/components/materials/MaterialCard";
import { MaterialCardSkeletonGrid } from "@/components/materials/MaterialCardSkeleton";
import { useViewingHistory } from "@/hooks/use-viewing-history";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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

const ViewingHistory = () => {
  const { user } = useAuth();
  const { history, loading, clearHistory } = useViewingHistory();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <History className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Sign in to view history</h2>
            <p className="text-muted-foreground mb-4">
              Create an account to track your viewing history
            </p>
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const materialsWithHistory = history.filter(h => h.material);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Header */}
        <section className="bg-library-sage py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-white/10 rounded-lg">
                    <History className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white">
                    Viewing History
                  </h1>
                </div>
                <p className="text-white/80 text-sm md:text-base">
                  Materials you've recently viewed
                </p>
              </div>
              
              {materialsWithHistory.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear History
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear viewing history?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your entire viewing history. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={clearHistory}>Clear History</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-6 md:py-8 lg:py-12">
          <div className="container mx-auto px-4">
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                {materialsWithHistory.length} {materialsWithHistory.length === 1 ? 'item' : 'items'} in history
              </p>
            </div>

            {/* Loading State */}
            {loading ? (
              <MaterialCardSkeletonGrid count={6} />
            ) : materialsWithHistory.length > 0 ? (
              <div className="space-y-8">
                {materialsWithHistory.map((item) => (
                  <div key={item.id} className="relative">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        Viewed {formatDistanceToNow(new Date(item.viewed_at), { addSuffix: true })}
                        {item.view_count > 1 && ` • ${item.view_count} views`}
                      </span>
                    </div>
                    <div className="max-w-sm">
                      {item.material && (
                        <MaterialCard material={item.material} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 md:py-16">
                <History className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No viewing history</h3>
                <p className="text-muted-foreground mb-4">
                  Start browsing materials to build your history
                </p>
                <Link to="/browse">
                  <Button>Browse Materials</Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ViewingHistory;
