import { useState, useMemo } from "react";
import { GraduationCap, Play, Clock, Star, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MaterialCard from "@/components/materials/MaterialCard";
import MaterialsFilter from "@/components/materials/MaterialsFilter";
import { useMaterials } from "@/hooks/use-materials";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Tutorials = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { data: tutorials = [], isLoading } = useMaterials("tutorial");

  const filteredTutorials = useMemo(() => {
    let result = tutorials.filter((tutorial) => {
      const matchesSearch =
        tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutorial.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment =
        selectedDepartment === "All Departments" || tutorial.department === selectedDepartment;
      const matchesYear =
        selectedYear === "All Years" || tutorial.year.toString() === selectedYear;
      return matchesSearch && matchesDepartment && matchesYear;
    });

    if (sortBy === "newest") {
      result.sort((a, b) => b.year - a.year);
    } else if (sortBy === "oldest") {
      result.sort((a, b) => a.year - b.year);
    } else if (sortBy === "popular") {
      result.sort((a, b) => b.downloads - a.downloads);
    } else if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [tutorials, searchQuery, selectedDepartment, selectedYear, sortBy]);

  const totalPages = Math.ceil(filteredTutorials.length / itemsPerPage);
  const paginatedTutorials = filteredTutorials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Featured tutorials (top 3 by downloads)
  const featuredTutorials = useMemo(() => {
    return [...tutorials].sort((a, b) => b.downloads - a.downloads).slice(0, 3);
  }, [tutorials]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Header */}
        <section className="bg-library-gold py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                Tutorials
              </h1>
            </div>
            <p className="text-white/90 max-w-2xl">
              Interactive learning resources including video tutorials, step-by-step guides, 
              and hands-on workshops to enhance your skills.
            </p>
          </div>
        </section>

        {/* Featured Tutorials */}
        {featuredTutorials.length > 0 && (
          <section className="py-8 bg-muted/50">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-2 mb-6">
                <Star className="h-5 w-5 text-library-gold fill-library-gold" />
                <h2 className="text-xl font-display font-semibold text-foreground">
                  Popular Tutorials
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredTutorials.map((tutorial) => (
                  <div
                    key={tutorial.id}
                    className="bg-card p-4 rounded-lg border border-border hover:border-library-gold/50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-library-gold/10 rounded-lg group-hover:bg-library-gold/20 transition-colors">
                        <Play className="h-5 w-5 text-library-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-library-gold transition-colors">
                          {tutorial.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {tutorial.author}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {tutorial.department}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {tutorial.downloads} views
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Content */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            {/* Filters */}
            <div className="mb-8">
              <MaterialsFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedDepartment={selectedDepartment}
                onDepartmentChange={setSelectedDepartment}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {paginatedTutorials.length} of {filteredTutorials.length} tutorials
              </p>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-library-gold" />
              </div>
            ) : paginatedTutorials.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedTutorials.map((tutorial) => (
                  <MaterialCard key={tutorial.id} material={tutorial} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <GraduationCap className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No tutorials found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => setCurrentPage(i + 1)}
                          isActive={currentPage === i + 1}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Tutorials;
