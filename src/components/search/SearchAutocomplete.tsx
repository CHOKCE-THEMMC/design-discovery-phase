import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Book, FileText, ScrollText, GraduationCap, History, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { searchMaterials, type SearchResult } from "@/lib/search-utils";
import { Material } from "@/hooks/use-materials";

interface SearchAutocompleteProps {
  onClose?: () => void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

const typeIcons = {
  book: Book,
  "lecture-note": FileText,
  "past-paper": ScrollText,
  tutorial: GraduationCap,
};

const RECENT_SEARCHES_KEY = "dti-recent-searches";

const SearchAutocomplete = ({
  onClose,
  className,
  inputClassName,
  placeholder = "Search for books, notes, papers...",
  autoFocus = false,
}: SearchAutocompleteProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult<Material>[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [materials, setMaterials] = useState<Material[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  // Load materials for autocomplete
  useEffect(() => {
    const loadMaterials = async () => {
      const { data } = await supabase
        .from("materials")
        .select("*")
        .eq("status", "approved")
        .limit(100);

      if (data) {
        const transformed: Material[] = data.map((row) => ({
          id: row.id,
          title: row.title,
          author: row.author || "Unknown",
          type: row.type === "lecture_note" ? "lecture-note" :
                row.type === "past_paper" ? "past-paper" :
                row.type as Material["type"],
          department: row.department,
          year: row.year || new Date().getFullYear(),
          description: row.description || "",
          downloads: row.download_count || 0,
          fileUrl: row.file_url || undefined,
          fileName: row.file_name || undefined,
          thumbnailUrl: row.thumbnail_url || undefined,
        }));
        setMaterials(transformed);
      }
    };

    loadMaterials();
  }, []);

  // Update suggestions as user types
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const results = searchMaterials(materials, query, { limit: 6, minScore: 0.15 });
    setSuggestions(results);
  }, [query, materials]);

  const saveRecentSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    const updated = [trimmed, ...recentSearches.filter((s) => s !== trimmed)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const handleSearch = (searchTerm?: string) => {
    const term = searchTerm || query;
    if (term.trim()) {
      saveRecentSearch(term.trim());
      navigate(`/browse?search=${encodeURIComponent(term.trim())}`);
      setIsOpen(false);
      setQuery("");
      onClose?.();
    }
  };

  const handleSelectMaterial = (material: Material) => {
    saveRecentSearch(material.title);
    navigate(`/browse?search=${encodeURIComponent(material.title)}`);
    setIsOpen(false);
    setQuery("");
    onClose?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = suggestions.length + (query.trim().length < 2 ? recentSearches.length : 0);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, totalItems - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0) {
        if (query.trim().length < 2 && selectedIndex < recentSearches.length) {
          handleSearch(recentSearches[selectedIndex]);
        } else if (selectedIndex < suggestions.length) {
          handleSelectMaterial(suggestions[selectedIndex].item);
        }
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      onClose?.();
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const showDropdown = isOpen && (suggestions.length > 0 || (query.trim().length < 2 && recentSearches.length > 0));

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          className={cn("pl-10 pr-4", inputClassName)}
          autoFocus={autoFocus}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => setQuery("")}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {query.trim().length < 2 && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <History className="h-3 w-3" />
                  Recent Searches
                </span>
                <button
                  className="text-xs hover:text-foreground"
                  onClick={clearRecentSearches}
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((search, idx) => (
                <button
                  key={search}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors flex items-center gap-2",
                    selectedIndex === idx && "bg-muted"
                  )}
                  onClick={() => handleSearch(search)}
                >
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  {search}
                </button>
              ))}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="p-2">
              {query.trim().length >= 2 && (
                <div className="px-2 py-1 text-xs text-muted-foreground">
                  Suggestions
                </div>
              )}
              {suggestions.map(({ item, score }, idx) => {
                const Icon = typeIcons[item.type] || Book;
                const adjustedIdx = query.trim().length < 2 ? idx + recentSearches.length : idx;
                return (
                  <button
                    key={item.id}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors flex items-center gap-3",
                      selectedIndex === adjustedIdx && "bg-muted"
                    )}
                    onClick={() => handleSelectMaterial(item)}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.author} • {item.department}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize flex-shrink-0">
                      {item.type.replace("-", " ")}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {query.trim().length >= 2 && suggestions.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No materials found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
