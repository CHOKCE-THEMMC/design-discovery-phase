import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  Users, 
  FileCheck, 
  Download,
  Clock,
  TrendingUp,
  FileX,
  BookMarked
} from 'lucide-react';

interface Stats {
  totalMaterials: number;
  totalUsers: number;
  pendingApprovals: number;
  totalDownloads: number;
  approvedMaterials: number;
  rejectedMaterials: number;
  bookCount: number;
  lectureNoteCount: number;
  pastPaperCount: number;
  tutorialCount: number;
}

export function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    totalMaterials: 0,
    totalUsers: 0,
    pendingApprovals: 0,
    totalDownloads: 0,
    approvedMaterials: 0,
    rejectedMaterials: 0,
    bookCount: 0,
    lectureNoteCount: 0,
    pastPaperCount: 0,
    tutorialCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentMaterials, setRecentMaterials] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentMaterials();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch materials stats
      const { data: materials, error: materialsError } = await supabase
        .from('materials')
        .select('status, type, download_count');

      if (materialsError) throw materialsError;

      // Fetch users count
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      const totalDownloads = materials?.reduce((sum, m) => sum + (m.download_count || 0), 0) || 0;
      const pending = materials?.filter(m => m.status === 'pending').length || 0;
      const approved = materials?.filter(m => m.status === 'approved').length || 0;
      const rejected = materials?.filter(m => m.status === 'rejected').length || 0;
      
      const bookCount = materials?.filter(m => m.type === 'book').length || 0;
      const lectureNoteCount = materials?.filter(m => m.type === 'lecture_note').length || 0;
      const pastPaperCount = materials?.filter(m => m.type === 'past_paper').length || 0;
      const tutorialCount = materials?.filter(m => m.type === 'tutorial').length || 0;

      setStats({
        totalMaterials: materials?.length || 0,
        totalUsers: usersCount || 0,
        pendingApprovals: pending,
        totalDownloads,
        approvedMaterials: approved,
        rejectedMaterials: rejected,
        bookCount,
        lectureNoteCount,
        pastPaperCount,
        tutorialCount,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentMaterials(data || []);
    } catch (error) {
      console.error('Error fetching recent materials:', error);
    }
  };

  const statCards = [
    { title: 'Total Materials', value: stats.totalMaterials, icon: BookOpen, color: 'text-primary' },
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-library-burgundy' },
    { title: 'Pending Approvals', value: stats.pendingApprovals, icon: Clock, color: 'text-library-gold' },
    { title: 'Total Downloads', value: stats.totalDownloads, icon: Download, color: 'text-green-600' },
  ];

  const materialTypeCards = [
    { title: 'Books', value: stats.bookCount, icon: BookMarked },
    { title: 'Lecture Notes', value: stats.lectureNoteCount, icon: FileCheck },
    { title: 'Past Papers', value: stats.pastPaperCount, icon: FileX },
    { title: 'Tutorials', value: stats.tutorialCount, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {loading ? '...' : stat.value.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Material Types Breakdown */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg">Materials by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {materialTypeCards.map((type) => (
              <div key={type.title} className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <type.icon className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{loading ? '...' : type.value}</p>
                  <p className="text-sm text-muted-foreground">{type.title}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Materials */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg">Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          {recentMaterials.length > 0 ? (
            <div className="space-y-4">
              {recentMaterials.map((material) => (
                <div key={material.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{material.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {material.department} • {material.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    material.status === 'approved' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : material.status === 'rejected'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {material.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No materials uploaded yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
