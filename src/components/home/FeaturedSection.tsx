import { Link } from "react-router-dom";
import { BookOpen, Download, Eye, Star, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFeaturedMaterials } from "@/hooks/use-materials";

const typeColors: Record<string, string> = {
  "book": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "lecture-note": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "past-paper": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "tutorial": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const typeLabels: Record<string, string> = {
  "book": "Book",
  "lecture-note": "Lecture Notes",
  "past-paper": "Past Paper",
  "tutorial": "Tutorial",
};

const FeaturedSection = () => {
  const { data: materials = [], isLoading } = useFeaturedMaterials(4);

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-sm font-medium text-library-gold uppercase tracking-wider">
              Popular Resources
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
              Featured Materials
            </h2>
          </div>
          <Link to="/browse">
            <Button variant="outline" className="group">
              View All Materials
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : materials.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {materials.map((material, index) => (
              <Link
                key={material.id}
                to={`/browse`}
                className="group bg-card rounded-xl overflow-hidden border border-border hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Cover Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {material.thumbnailUrl ? (
                    <img
                      src={material.thumbnailUrl}
                      alt={material.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <BookOpen className="h-12 w-12 text-primary/40" />
                    </div>
                  )}
                  <Badge className={`absolute top-3 left-3 ${typeColors[material.type] || ""}`}>
                    {typeLabels[material.type] || material.type}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-4 w-4 fill-library-gold text-library-gold" />
                    <span className="text-sm font-medium text-foreground">4.5</span>
                    <span className="text-sm text-muted-foreground">• {material.department}</span>
                  </div>

                  <h3 className="font-display text-lg font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {material.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    by {material.author}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {(material.downloads * 2).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {material.downloads.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No materials yet</h3>
            <p className="text-muted-foreground">
              Be the first to upload materials to the library
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedSection;
