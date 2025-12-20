import { Book, FileText, ScrollText, GraduationCap, Download, Eye, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
}

interface MaterialCardProps {
  material: Material;
}

const typeIcons = {
  "book": Book,
  "lecture-note": FileText,
  "past-paper": ScrollText,
  "tutorial": GraduationCap,
};

const typeColors = {
  "book": "bg-primary",
  "lecture-note": "bg-library-sage",
  "past-paper": "bg-library-burgundy",
  "tutorial": "bg-library-gold",
};

const MaterialCard = ({ material }: MaterialCardProps) => {
  const Icon = typeIcons[material.type];
  const colorClass = typeColors[material.type];

  const handlePreview = () => {
    if (material.fileUrl) {
      window.open(material.fileUrl, "_blank");
    } else {
      toast.info("Preview not available for this material");
    }
  };

  const handleDownload = async () => {
    if (!material.fileUrl) {
      toast.info("Download not available for this material");
      return;
    }

    try {
      // Increment download count
      await supabase
        .from("materials")
        .update({ download_count: (material.downloads || 0) + 1 })
        .eq("id", material.id);

      // Trigger download
      const link = document.createElement("a");
      link.href = material.fileUrl;
      link.download = material.fileName || material.title;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Download started!");
    } catch (error) {
      console.error("Download error:", error);
      // Still try to download even if count update fails
      window.open(material.fileUrl, "_blank");
    }
  };

  return (
    <div className="book-card bg-card group">
      <div className={`h-32 ${colorClass} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent" />
        <Icon className="absolute bottom-4 right-4 h-16 w-16 text-white/20" />
        <Badge 
          variant="secondary" 
          className="absolute top-3 left-3 bg-white/90 text-foreground text-xs"
        >
          {material.type.replace("-", " ")}
        </Badge>
      </div>
      
      <div className="p-4 space-y-3">
        <h3 className="font-display font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {material.title}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-3.5 w-3.5" />
          <span className="truncate">{material.author}</span>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {material.year}
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            {material.downloads}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {material.description}
        </p>
        
        <Badge variant="outline" className="text-xs">
          {material.department}
        </Badge>
        
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={handlePreview}>
            <Eye className="h-3.5 w-3.5 mr-1" />
            Preview
          </Button>
          <Button size="sm" className="flex-1 text-xs" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5 mr-1" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MaterialCard;
