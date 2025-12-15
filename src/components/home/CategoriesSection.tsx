import { Link } from "react-router-dom";
import { BookOpen, FileText, ScrollText, Video, ArrowRight } from "lucide-react";

const categories = [
  {
    id: "books",
    title: "Books",
    description: "Comprehensive textbooks and reference materials across all departments",
    icon: BookOpen,
    count: "10,000+",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-500/30",
    href: "/materials?type=books",
  },
  {
    id: "lecture-notes",
    title: "Lecture Notes",
    description: "Detailed notes from lecturers covering course materials and key concepts",
    icon: FileText,
    count: "5,000+",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-500/30",
    href: "/materials?type=lecture-notes",
  },
  {
    id: "past-papers",
    title: "Past Papers",
    description: "Previous examination papers with solutions for exam preparation",
    icon: ScrollText,
    count: "3,000+",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-500/30",
    href: "/materials?type=past-papers",
  },
  {
    id: "tutorials",
    title: "Video Tutorials",
    description: "Step-by-step video guides and educational content from instructors",
    icon: Video,
    count: "500+",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-500/30",
    href: "/tutorials",
  },
];

const CategoriesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-sm font-medium text-library-gold uppercase tracking-wider">
            Browse Resources
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Explore Our Categories
          </h2>
          <p className="text-muted-foreground">
            Find the academic resources you need, organized by type for easy access
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={category.href}
              className="group relative overflow-hidden rounded-xl bg-card border border-border p-6 hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-lg ${category.color} mb-4`}>
                <category.icon className="h-7 w-7" />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {category.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {category.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground/70">
                  {category.count} items
                </span>
                <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Browse <ArrowRight className="h-4 w-4" />
                </span>
              </div>

              {/* Decorative Border */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 ${category.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
