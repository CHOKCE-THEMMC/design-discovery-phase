import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LibraryStats {
  books: number;
  lectureNotes: number;
  pastPapers: number;
  tutorials: number;
  totalResources: number;
  activeStudents: number;
  lecturers: number;
  departments: number;
}

export function useLibraryStats() {
  return useQuery({
    queryKey: ['library-stats'],
    queryFn: async (): Promise<LibraryStats> => {
      // Fetch material counts by type
      const { data: materials, error: materialsError } = await supabase
        .from('materials')
        .select('type')
        .eq('status', 'approved');

      if (materialsError) throw materialsError;

      // Count by type
      const books = materials?.filter(m => m.type === 'book').length || 0;
      const lectureNotes = materials?.filter(m => m.type === 'lecture_note').length || 0;
      const pastPapers = materials?.filter(m => m.type === 'past_paper').length || 0;
      const tutorials = materials?.filter(m => m.type === 'tutorial').length || 0;
      const totalResources = materials?.length || 0;

      // Fetch user counts by role
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role');

      if (rolesError) throw rolesError;

      const activeStudents = userRoles?.filter(r => r.role === 'user').length || 0;
      const lecturers = userRoles?.filter(r => r.role === 'lecturer').length || 0;

      // Get unique departments from materials
      const { data: deptData, error: deptError } = await supabase
        .from('materials')
        .select('department')
        .eq('status', 'approved');

      if (deptError) throw deptError;

      const uniqueDepartments = new Set(deptData?.map(m => m.department));
      const departments = uniqueDepartments.size;

      return {
        books,
        lectureNotes,
        pastPapers,
        tutorials,
        totalResources,
        activeStudents,
        lecturers,
        departments,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Helper function to format numbers with + suffix
export function formatStatCount(count: number): string {
  if (count >= 1000) {
    return `${Math.floor(count / 1000)},${String(count % 1000).padStart(3, '0')}+`;
  }
  return `${count}+`;
}
