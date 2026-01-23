import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface Bookmark {
  id: string;
  material_id: string;
  created_at: string;
}

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookmarks = useCallback(async () => {
    if (!user) {
      setBookmarks([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const isBookmarked = useCallback(
    (materialId: string) => {
      return bookmarks.some((b) => b.material_id === materialId);
    },
    [bookmarks]
  );

  const addBookmark = async (materialId: string) => {
    if (!user) {
      toast.error("Please sign in to bookmark materials");
      return false;
    }

    try {
      const { error } = await supabase.from("bookmarks").insert({
        user_id: user.id,
        material_id: materialId,
      });

      if (error) throw error;

      await fetchBookmarks();
      toast.success("Material bookmarked!");
      return true;
    } catch (error: any) {
      if (error.code === "23505") {
        toast.info("Already bookmarked");
      } else {
        console.error("Error adding bookmark:", error);
        toast.error("Failed to bookmark");
      }
      return false;
    }
  };

  const removeBookmark = async (materialId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("material_id", materialId);

      if (error) throw error;

      await fetchBookmarks();
      toast.success("Bookmark removed");
      return true;
    } catch (error) {
      console.error("Error removing bookmark:", error);
      toast.error("Failed to remove bookmark");
      return false;
    }
  };

  const toggleBookmark = async (materialId: string) => {
    if (isBookmarked(materialId)) {
      return removeBookmark(materialId);
    } else {
      return addBookmark(materialId);
    }
  };

  return {
    bookmarks,
    loading,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    refetch: fetchBookmarks,
  };
}
