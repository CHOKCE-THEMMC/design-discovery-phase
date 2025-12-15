import { Link } from "react-router-dom";
import { BookOpen, Download, Eye, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock data for featured materials
const featuredMaterials = [
  {
    id: 1,
    title: "Introduction to Computer Science",
    author: "Dr. John Smith",
    type: "Book",
    department: "Computer Science",
    year: 2024,
    views: 1250,
    downloads: 450,
    rating: 4.8,
    cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    title: "Advanced Mathematics for Engineers",
    author: "Prof. Sarah Johnson",
    type: "Lecture Notes",
    department: "Mathematics",
    year: 2024,
    views: 980,
    downloads: 320,
    rating: 4.6,
    cover: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    title: "Data Structures & Algorithms",
    author: "Dr. Michael Chen",
    type: "Past Paper",
    department: "Computer Science",
    year: 2023,
    views: 2100,
    downloads: 890,
    rating: 4.9,
    cover: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    title: "Business Management Fundamentals",
    author: "Dr. Emily Brown",
    type: "Book",
    department: "Business",
    year: 2024,
    views: 750,
    downloads: 280,
    rating: 4.5,
    cover: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop",
  },
];

const typeColors: Record<string, string> = {
  "Book": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Lecture Notes": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Past Paper": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Tutorial": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const FeaturedSection = () => {
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
          <Link to="/materials">
            <Button variant="outline" className="group">
              View All Materials
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredMaterials.map((material, index) => (
            <Link
              key={material.id}
              to={`/materials/${material.id}`}
              className="group bg-card rounded-xl overflow-hidden border border-border hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Cover Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={material.cover}
                  alt={material.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className={`absolute top-3 left-3 ${typeColors[material.type]}`}>
                  {material.type}
                </Badge>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-4 w-4 fill-library-gold text-library-gold" />
                  <span className="text-sm font-medium text-foreground">{material.rating}</span>
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
                    {material.views.toLocaleString()}
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
      </div>
    </section>
  );
};

export default FeaturedSection;
