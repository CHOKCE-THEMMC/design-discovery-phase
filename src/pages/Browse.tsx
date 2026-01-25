import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Library, Book, FileText, ScrollText, GraduationCap } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MaterialCard from "@/components/materials/MaterialCard";
import { MaterialCardSkeletonGrid } from "@/components/materials/MaterialCardSkeleton";
import MaterialsFilter from "@/components/materials/MaterialsFilter";
import { useAllMaterials } from "@/hooks/use-materials";
import { filterAndSortMaterials } from "@/lib/search-utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const materialTypes = [
  { value: "all", label: "All Materials", icon: Library },
  { value: "book", label: "Books", icon: Book },
  { value: "lecture-note", label: "Lecture Notes", icon: FileText },
  { value: "past-paper", label: "Past Papers", icon: ScrollText },
  { value: "tutorial", label: "Tutorials", icon: GraduationCap },
];

const Browse = () => {
  const [searchParams] = useSearchParams();
  const programFromUrl = searchParams.get('program');
  const yearFromUrl = searchParams.get('year');

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(programFromUrl || "All Programs");
  const [selectedYear, setSelectedYear] = useState(yearFromUrl ? `Year ${yearFromUrl}` : "All Years");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Update filters when URL params change
  useEffect(() => {
    if (programFromUrl) {
      setSelectedDepartment(programFromUrl);
    }
    if (yearFromUrl) {
      setSelectedYear(`Year ${yearFromUrl}`);
    }
  }, [programFromUrl, yearFromUrl]);

  const { data: materials = [], isLoading } = useAllMaterials();

  const filteredMaterials = useMemo(() => {
    return filterAndSortMaterials(materials, {
      searchQuery,
      department: selectedDepartment,
      year: selectedYear,
      type: selectedType,
      sortBy,
    });
  }, [materials, searchQuery, selectedDepartment, selectedYear, selectedType, sortBy]);

  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const paginatedMaterials = filteredMaterials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-br from-primary via-primary/90 to-library-burgundy py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Library className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                Browse All Materials
              </h1>
            </div>
            <p className="text-white/80 max-w-2xl">
              Discover our complete collection of academic resources including books, 
              lecture notes, past papers, and interactive tutorials.
            </p>
          </div>
        </section>

        {/* Type Filter Tabs */}
        <section className="border-b border-border bg-card sticky top-16 z-40">
          <div className="container mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto py-2">
              {materialTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.value}
                    variant={selectedType === type.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleTypeChange(type.value)}
                    className={cn(
                      "flex items-center gap-2 whitespace-nowrap",
                      selectedType === type.value && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {type.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

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
                Showing {paginatedMaterials.length} of {filteredMaterials.length} materials
              </p>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <MaterialCardSkeletonGrid count={9} />
            ) : paginatedMaterials.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedMaterials.map((material) => (
                  <MaterialCard key={material.id} material={material} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Library className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No materials found</h3>
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

export default Browse;
