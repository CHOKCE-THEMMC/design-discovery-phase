import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { GROUPED_PROGRAMS } from "@/lib/programs";

interface MaterialsFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
  selectedYear: string;
  onYearChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

const currentYear = new Date().getFullYear();
const years = ["All Years", ...Array.from({ length: 6 }, (_, i) => (currentYear - i).toString())];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "popular", label: "Most Popular" },
  { value: "title", label: "Title A-Z" },
];

const MaterialsFilter = ({
  searchQuery,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  selectedYear,
  onYearChange,
  sortBy,
  onSortChange,
}: MaterialsFilterProps) => {
  const handleClearFilters = () => {
    onSearchChange("");
    onDepartmentChange("All Programs");
    onYearChange("All Years");
    onSortChange("newest");
  };

  const hasActiveFilters = 
    searchQuery || 
    selectedDepartment !== "All Programs" || 
    selectedYear !== "All Years" || 
    sortBy !== "newest";

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, author, or keyword..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      {/* Filters Row - Mobile optimized */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters:</span>
        </div>

        <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3 flex-1">
          <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
            <SelectTrigger className="w-full sm:w-[160px] lg:w-[200px] bg-card text-sm">
              <SelectValue placeholder="Program" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-50 max-h-[300px]">
              <SelectItem value="All Programs">All Programs</SelectItem>
              {Object.entries(GROUPED_PROGRAMS).map(([group, programs]) => (
                <SelectGroup key={group}>
                  <SelectLabel className="text-xs font-semibold text-muted-foreground">{group}</SelectLabel>
                  {programs.map((program) => (
                    <SelectItem key={program} value={program}>
                      {program}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={onYearChange}>
            <SelectTrigger className="w-full sm:w-[120px] lg:w-[140px] bg-card text-sm">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-50">
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-full sm:w-[130px] lg:w-[150px] bg-card text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-50">
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs whitespace-nowrap"
              onClick={handleClearFilters}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialsFilter;
