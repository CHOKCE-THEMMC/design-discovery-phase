import { Search, BookOpen, FileText, GraduationCap, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/materials?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const stats = [
    { icon: BookOpen, label: "Books", count: "10,000+" },
    { icon: FileText, label: "Lecture Notes", count: "5,000+" },
    { icon: GraduationCap, label: "Past Papers", count: "3,000+" },
    { icon: Video, label: "Tutorials", count: "500+" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-library-burgundy min-h-[600px] flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 border border-white/20 rounded-full" />
        <div className="absolute bottom-20 right-20 w-96 h-96 border border-white/20 rounded-full" />
        <div className="absolute top-40 right-40 w-32 h-32 border border-white/30 rounded-full" />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-library-gold animate-pulse" />
            <span className="text-sm text-white/90 font-medium">
              Welcome to the University Library Portal
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Discover Knowledge,{" "}
            <span className="text-library-gold">Empower</span> Your Learning
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Access thousands of academic resources including books, lecture notes, 
            past examination papers, and video tutorials. Your academic success starts here.
          </p>

          {/* Search Bar */}
          <form 
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-12 animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for books, notes, papers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-library-gold"
              />
            </div>
            <Button 
              type="submit"
              size="lg" 
              className="h-12 px-8 bg-library-gold text-primary font-semibold hover:bg-library-gold/90 transition-colors"
            >
              Search
            </Button>
          </form>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className="flex flex-col items-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
              >
                <stat.icon className="h-8 w-8 text-library-gold mb-2" />
                <span className="text-2xl font-bold text-white">{stat.count}</span>
                <span className="text-sm text-white/70">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
