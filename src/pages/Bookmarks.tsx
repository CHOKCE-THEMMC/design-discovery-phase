import { Bookmark, Trash2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MaterialCard from "@/components/materials/MaterialCard";
import { MaterialCardSkeletonGrid } from "@/components/materials/MaterialCardSkeleton";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Material } from "@/hooks/use-materials";
import { Link } from "react-router-dom";

const mapMaterialType = (dbType: string): Material["type"] => {
  const typeMap: Record<string, Material["type"]> = {
    book: "book",
    lecture_note: "lecture-note",
    past_paper: "past-paper",
    tutorial: "tutorial",
  };
  return typeMap[dbType] || "book";
};

const Bookmarks = () => {
  const { user } = useAuth();
  const { bookmarks, loading: bookmarksLoading } = useBookmarks();

  const { data: materials = [], isLoading: materialsLoading } = useQuery({
    queryKey: ["bookmarked-materials", bookmarks.map(b => b.material_id)],
    queryFn: async () => {
      if (bookmarks.length === 0) return [];
      
      const materialIds = bookmarks.map(b => b.material_id);
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .in("id", materialIds);

      if (error) throw error;

      return (data || []).map((row): Material => ({
        id: row.id,
        title: row.title,
        author: row.author || "Unknown Author",
        type: mapMaterialType(row.type),
        department: row.department,
        year: row.year || new Date().getFullYear(),
        description: row.description || "",
        downloads: row.download_count || 0,
        fileUrl: row.file_url || undefined,
        fileName: row.file_name || undefined,
        thumbnailUrl: row.thumbnail_url || undefined,
        isVideo: row.is_video || false,
        videoUrl: row.video_url || undefined,
        contentType: row.content_type || 'document',
        previewPages: row.preview_pages || 3,
      }));
    },
    enabled: bookmarks.length > 0,
  });

  const isLoading = bookmarksLoading || materialsLoading;

  // Sort materials to match bookmark order (most recent first)
  const sortedMaterials = bookmarks
    .map(b => materials.find(m => m.id === b.material_id))
    .filter((m): m is Material => m !== undefined);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <Bookmark className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Sign in to view bookmarks</h2>
            <p className="text-muted-foreground mb-4">
              Create an account to save and access your favorite materials
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Header */}
        <section className="bg-primary py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-white/10 rounded-lg">
                <Bookmark className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white">
                My Bookmarks
              </h1>
            </div>
            <p className="text-white/80 text-sm md:text-base">
              Your saved materials for quick access
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-6 md:py-8 lg:py-12">
          <div className="container mx-auto px-4">
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                {sortedMaterials.length} bookmarked {sortedMaterials.length === 1 ? 'material' : 'materials'}
              </p>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <MaterialCardSkeletonGrid count={6} />
            ) : sortedMaterials.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {sortedMaterials.map((material) => (
                  <MaterialCard key={material.id} material={material} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 md:py-16">
                <Bookmark className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No bookmarks yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start exploring and bookmark materials you want to save
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

export default Bookmarks;
