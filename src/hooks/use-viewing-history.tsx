import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Material } from "@/hooks/use-materials";

export interface ViewingHistoryItem {
  id: string;
  material_id: string;
  viewed_at: string;
  view_count: number;
  material?: Material;
}

export function useViewingHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<ViewingHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setHistory([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("viewing_history")
        .select(`
          id,
          material_id,
          viewed_at,
          view_count,
          materials (
            id,
            title,
            author,
            type,
            department,
            year,
            description,
            download_count,
            file_url,
            file_name,
            thumbnail_url,
            is_video,
            video_url,
            content_type,
            preview_pages
          )
        `)
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const transformedData: ViewingHistoryItem[] = (data || []).map((item: any) => ({
        id: item.id,
        material_id: item.material_id,
        viewed_at: item.viewed_at,
        view_count: item.view_count,
        material: item.materials ? {
          id: item.materials.id,
          title: item.materials.title,
          author: item.materials.author || "Unknown Author",
          type: item.materials.type === "lecture_note" ? "lecture-note" :
                item.materials.type === "past_paper" ? "past-paper" :
                item.materials.type,
          department: item.materials.department,
          year: item.materials.year || new Date().getFullYear(),
          description: item.materials.description || "",
          downloads: item.materials.download_count || 0,
          fileUrl: item.materials.file_url,
          fileName: item.materials.file_name,
          thumbnailUrl: item.materials.thumbnail_url,
          isVideo: item.materials.is_video,
          videoUrl: item.materials.video_url,
          contentType: item.materials.content_type,
          previewPages: item.materials.preview_pages,
        } : undefined,
      }));

      setHistory(transformedData);
    } catch (error) {
      console.error("Error fetching viewing history:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const recordView = async (materialId: string) => {
    if (!user) return;

    try {
      // Check if entry exists
      const { data: existing } = await supabase
        .from("viewing_history")
        .select("id, view_count")
        .eq("user_id", user.id)
        .eq("material_id", materialId)
        .single();

      if (existing) {
        // Update existing entry
        await supabase
          .from("viewing_history")
          .update({
            viewed_at: new Date().toISOString(),
            view_count: existing.view_count + 1,
          })
          .eq("id", existing.id);
      } else {
        // Create new entry
        await supabase.from("viewing_history").insert({
          user_id: user.id,
          material_id: materialId,
        });
      }

      await fetchHistory();
    } catch (error) {
      console.error("Error recording view:", error);
    }
  };

  const clearHistory = async () => {
    if (!user) return;

    try {
      await supabase
        .from("viewing_history")
        .delete()
        .eq("user_id", user.id);

      setHistory([]);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  return {
    history,
    loading,
    recordView,
    clearHistory,
    refetch: fetchHistory,
  };
}
