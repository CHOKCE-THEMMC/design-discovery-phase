import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type MaterialRow = Database["public"]["Tables"]["materials"]["Row"];

export interface Material {
  id: string;
  title: string;
  author: string;
  type: "book" | "lecture-note" | "past-paper" | "tutorial";
  department: string;
  year: number;
  description: string;
  downloads: number;
  fileUrl?: string;
  fileName?: string;
  thumbnailUrl?: string;
  isVideo?: boolean;
  videoUrl?: string;
  contentType?: string;
  previewPages?: number;
}

// Map database type to frontend type
const mapMaterialType = (dbType: Database["public"]["Enums"]["material_type"]): Material["type"] => {
  const typeMap: Record<Database["public"]["Enums"]["material_type"], Material["type"]> = {
    book: "book",
    lecture_note: "lecture-note",
    past_paper: "past-paper",
    tutorial: "tutorial",
  };
  return typeMap[dbType];
};

// Transform database row to Material
const transformMaterial = (row: MaterialRow): Material => ({
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
  isVideo: (row as any).is_video || false,
  videoUrl: (row as any).video_url || undefined,
  contentType: (row as any).content_type || 'document',
  previewPages: (row as any).preview_pages || 3,
});

export const useMaterials = (type?: Database["public"]["Enums"]["material_type"]) => {
  return useQuery({
    queryKey: ["materials", type],
    queryFn: async () => {
      let query = supabase
        .from("materials")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (type) {
        query = query.eq("type", type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(transformMaterial);
    },
  });
};

export const useFeaturedMaterials = (limit = 4) => {
  return useQuery({
    queryKey: ["featured-materials", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .eq("status", "approved")
        .order("download_count", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(transformMaterial);
    },
  });
};

export const useAllMaterials = () => {
  return useQuery({
    queryKey: ["all-materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(transformMaterial);
    },
  });
};
