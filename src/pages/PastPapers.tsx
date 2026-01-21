import { useState, useMemo } from "react";
import { ScrollText } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MaterialCard from "@/components/materials/MaterialCard";
import { MaterialCardSkeletonGrid } from "@/components/materials/MaterialCardSkeleton";
import MaterialsFilter from "@/components/materials/MaterialsFilter";
import { useMaterials } from "@/hooks/use-materials";
import { filterAndSortMaterials } from "@/lib/search-utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PastPapers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { data: papers = [], isLoading } = useMaterials("past_paper");

  const filteredPapers = useMemo(() => {
    return filterAndSortMaterials(papers, {
      searchQuery,
      department: selectedDepartment,
      year: selectedYear,
      sortBy,
    });
  }, [papers, searchQuery, selectedDepartment, selectedYear, sortBy]);

  const totalPages = Math.ceil(filteredPapers.length / itemsPerPage);
  const paginatedPapers = filteredPapers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Header */}
        <section className="bg-library-burgundy py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <ScrollText className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                Past Papers
              </h1>
            </div>
            <p className="text-white/80 max-w-2xl">
              Prepare effectively with our archive of past examination papers, 
              including solutions and marking schemes where available.
            </p>
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
                Showing {paginatedPapers.length} of {filteredPapers.length} past papers
              </p>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <MaterialCardSkeletonGrid count={6} />
            ) : paginatedPapers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedPapers.map((paper) => (
                  <MaterialCard key={paper.id} material={paper} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <ScrollText className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No past papers found</h3>
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

export default PastPapers;
