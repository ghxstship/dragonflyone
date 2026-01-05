"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import clsx from "clsx";
import { Modal } from "../Modal/index.js";
import { 
  Search, 
  X, 
  Clock, 
  Star, 
  Filter, 
  ChevronRight,
  FileText,
  Users,
  Calendar,
  DollarSign,
  Building,
  Package,
  Briefcase,
  MapPin,
} from "lucide-react";
import { globalSearchVariants } from "./GlobalSearch.variants.js";
import type { GlobalSearchProps, SearchFilter, SearchResult, SavedSearch } from "./GlobalSearch.types.js";

// Entity type icons
const entityIcons: Record<string, React.ReactNode> = {
  projects: <Briefcase className="size-4" />,
  contacts: <Users className="size-4" />,
  events: <Calendar className="size-4" />,
  invoices: <DollarSign className="size-4" />,
  venues: <Building className="size-4" />,
  assets: <Package className="size-4" />,
  documents: <FileText className="size-4" />,
  locations: <MapPin className="size-4" />,
};

// Search Input Component
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder: string;
  inputRef: React.RefObject<HTMLInputElement>;
}

function SearchInput({ value, onChange, onClear, placeholder, inputRef }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-spacing-4 top-1/2 -translate-y-1/2 size-5 text-text-muted" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={clsx(
          "w-full pl-spacing-12 pr-spacing-10 py-spacing-4",
          "bg-surface-primary border-b-2 border-border-primary",
          "text-body-lg text-text-primary placeholder:text-text-muted",
          "outline-none focus:border-primary-500 transition-colors"
        )}
        autoFocus
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-spacing-4 top-1/2 -translate-y-1/2 p-spacing-1 text-text-muted hover:text-text-disabled bg-transparent border-none cursor-pointer"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

// Recent Searches Component
interface RecentSearchesProps {
  searches: string[];
  onSelect: (query: string) => void;
  onClear: () => void;
}

function RecentSearches({ searches, onSelect, onClear }: RecentSearchesProps) {
  if (searches.length === 0) return null;

  return (
    <div className="px-spacing-4 py-spacing-3 border-b border-border-secondary">
      <div className="flex items-center justify-between mb-spacing-2">
        <span className="font-code text-mono-xs text-text-disabled uppercase tracking-wider">
          RECENT SEARCHES
        </span>
        <button
          onClick={onClear}
          className="text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="space-y-1">
        {searches.map((search, index) => (
          <button
            key={`${search}-${index}`}
            onClick={() => onSelect(search)}
            className="flex items-center gap-gap-sm px-spacing-2 py-spacing-1 text-left w-full border-none rounded-button bg-surface-secondary hover:bg-surface-tertiary transition-colors"
          >
            <Clock className="size-3 text-text-muted" />
            <span className="text-body-sm text-text-primary">{search}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Saved Searches Component
interface SavedSearchesProps {
  searches: SavedSearch[];
  onSelect: (search: SavedSearch) => void;
}

function SavedSearches({ searches, onSelect }: SavedSearchesProps) {
  if (searches.length === 0) return null;

  return (
    <div className="px-spacing-4 py-spacing-3 border-b border-border-secondary">
      <span className="font-code text-mono-xs text-text-disabled uppercase tracking-wider block mb-spacing-2">
        SAVED SEARCHES
      </span>
      <div className="space-y-1">
        {searches.map((search) => (
          <button
            key={search.id}
            onClick={() => onSelect(search)}
            className="flex items-center gap-gap-sm px-spacing-2 py-spacing-1 text-left w-full border-none rounded-button bg-surface-secondary hover:bg-surface-tertiary transition-colors"
          >
            <Star className="size-3 text-text-muted" />
            <span className="text-body-sm text-text-primary">{search.name}</span>
            <span className="text-body-xs text-text-muted">{search.query}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Filter Toggle Component
function FilterToggle({ 
  isActive, 
  count, 
  onClick 
}: { 
  isActive: boolean; 
  count: number; 
  onClick: () => void; 
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-gap-xs px-spacing-3 py-spacing-2 border-2 rounded-button transition-all duration-100",
        isActive
          ? "border-primary-500 bg-primary-500 text-white hover:border-primary-600"
          : "border-border bg-surface-secondary text-text-primary hover:border-primary-500 hover:bg-surface-tertiary"
      )}
    >
      <Filter className="size-4" />
      <span className="text-body-sm font-medium">
        Filters
      </span>
      {count > 0 && (
        <span className="px-spacing-1 py-spacing-0.5 text-mono-xs bg-primary-500 text-white rounded-badge">
          {count}
        </span>
      )}
    </button>
  );
}
interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  query: string;
  onSelect: (result: SearchResult) => void;
  selectedIndex: number;
}

function SearchResults({ results, loading, query, onSelect, selectedIndex }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-spacing-12">
        <div className="inline-block w-spacing-6 h-spacing-6 border-2 border-border border-t-primary-500 rounded-avatar animate-spin" />
      </div>
    );
  }

  if (query && results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-spacing-12 text-center">
        <Search className="size-12 text-text-secondary mb-spacing-4" />
        <p className="text-body-md text-text-disabled">No results found for &quot;{query}&quot;</p>
        <p className="text-body-sm text-text-muted mt-spacing-2">Try different keywords or filters</p>
      </div>
    );
  }

  if (!query) {
    return null;
  }

  // Group results by entity type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.entityType]) {
      acc[result.entityType] = [];
    }
    acc[result.entityType].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  let globalIndex = 0;

  return (
    <div className="overflow-y-auto max-h-container-lg">
      {Object.entries(groupedResults).map(([entityType, items]) => (
        <div key={entityType}>
          <div className="px-spacing-4 py-spacing-2 bg-surface-secondary border-b border-border-secondary">
            <span className="font-code text-mono-xs text-text-disabled uppercase tracking-wider flex items-center gap-gap-xs">
              {entityIcons[entityType] || <FileText className="size-3" />}
              {entityType}
              <span className="text-text-muted">({items.length})</span>
            </span>
          </div>
          {items.map((result) => {
            const currentIndex = globalIndex++;
            const isSelected = currentIndex === selectedIndex;
            return (
              <button
                key={result.id}
                onClick={() => onSelect(result)}
                className={clsx(
                  "w-full flex items-center gap-gap-md px-spacing-4 py-spacing-3 text-left border-none cursor-pointer transition-colors",
                  isSelected
                    ? "bg-primary-500 text-white"
                    : "bg-surface-primary text-text-primary hover:bg-surface-secondary"
                )}
              >
                <div className={clsx(
                  "p-spacing-2 rounded-card",
                  isSelected ? "bg-white/20" : "bg-surface-secondary"
                )}>
                  {entityIcons[result.entityType] || <FileText className="size-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={clsx(
                    "text-body-md font-medium truncate",
                    isSelected ? "text-white" : "text-text-primary"
                  )}>
                    {result.title}
                  </p>
                  {result.description && (
                    <p className={clsx(
                      "text-body-sm truncate",
                      isSelected ? "text-white/70" : "text-text-muted"
                    )}>
                      {result.description}
                    </p>
                  )}
                </div>
                <ChevronRight className={clsx(
                  "size-4",
                  isSelected ? "text-white" : "text-text-muted"
                )} />
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Main Component
export const GlobalSearch = React.forwardRef<HTMLDivElement, GlobalSearchProps>(
  function GlobalSearch({
    onSearch,
    onResultSelect,
    placeholder = "Search everything...",
    entityTypes,
    savedSearches,
    recentSearches,
    onSaveSearch,
    onClearHistory,
    open: controlledOpen,
    onOpenChange,
    className,
    ...props
  }, ref) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [filters, setFilters] = useState<SearchFilter[]>([]);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [showFilters, setShowFilters] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout>();

    // Handle controlled/uncontrolled state
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : open;
    const setIsOpen = isControlled ? onOpenChange : setOpen;

    // Debounced search
    const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilter[]) => {
      if (!onSearch) return;
      
      setLoading(true);
      try {
        const response = await onSearch(searchQuery, searchFilters);
        setResults(response.results);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, [onSearch]);

    // Handle query change with debounce
    const handleQueryChange = useCallback((value: string) => {
      setQuery(value);
      
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(value, filters);
      }, 300);
    }, [filters, performSearch]);

    // Handle filter changes
    const handleFilterChange = useCallback((newFilters: SearchFilter[]) => {
      setFilters(newFilters);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query, newFilters);
      }, 300);
    }, [query, performSearch]);

    // Handle save search
    const handleSaveSearch = useCallback(() => {
      if (!onSaveSearch || !query.trim()) return;
      
      const searchName = prompt("Enter a name for this search:");
      if (searchName && searchName.trim()) {
        onSaveSearch(searchName.trim(), query, filters);
      }
    }, [onSaveSearch, query, filters]);

    // Handle clear history
    const handleClearHistory = useCallback(() => {
      onClearHistory?.();
    }, [onClearHistory]);

    // Handle result selection
    const handleResultSelect = useCallback((result: SearchResult) => {
      onResultSelect?.(result);
      setIsOpen?.(false);
      setQuery("");
      setResults([]);
    }, [onResultSelect, setIsOpen]);

    // Handle clear
    const handleClear = useCallback(() => {
      setQuery("");
      setResults([]);
      setSelectedIndex(-1);
      inputRef.current?.focus();
    }, []);

    // Handle keyboard navigation
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
          case "Escape":
            e.preventDefault();
            setIsOpen?.(false);
            break;
          case "ArrowDown":
            e.preventDefault();
            setSelectedIndex(prev => 
              prev < results.length - 1 ? prev + 1 : prev
            );
            break;
          case "ArrowUp":
            e.preventDefault();
            setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
            break;
          case "Enter":
            e.preventDefault();
            if (selectedIndex >= 0 && results[selectedIndex]) {
              handleResultSelect(results[selectedIndex]);
            }
            break;
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, results, selectedIndex, handleResultSelect, setIsOpen]);

    // Cleanup timeout
    useEffect(() => {
      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    }, []);

    return (
      <div
        ref={ref}
        className={clsx(globalSearchVariants({ open }), className)}
        {...props}
      >
        <button
          onClick={() => setIsOpen?.(true)}
          className="flex items-center gap-gap-sm px-spacing-4 py-spacing-2 border-2 border-border rounded-button hover:border-primary-500 hover:bg-surface-secondary transition-colors"
        >
          <Search className="size-4 text-text-muted" />
          <span className="text-body-md text-text-primary">{placeholder}</span>
          <kbd className="px-spacing-2 py-spacing-1 text-mono-xs text-text-disabled border border-border rounded-badge">
            ⌘K
          </kbd>
        </button>

        {isOpen && (
          <Modal open={isOpen} onClose={() => setIsOpen?.(false)}>
            <div className="w-full max-w-4xl mx-auto bg-surface-primary border-2 border-border rounded-modal shadow-hard">
              {/* Search Input */}
              <SearchInput
                value={query}
                onChange={handleQueryChange}
                onClear={handleClear}
                placeholder={placeholder}
                inputRef={inputRef}
              />

              {/* Filter Toggle */}
              <div className="px-spacing-4 py-spacing-2 border-b border-border-secondary">
                <FilterToggle
                  isActive={showFilters}
                  count={filters.length}
                  onClick={() => setShowFilters(!showFilters)}
                />
              </div>

              {/* Entity Type Filters */}
              {showFilters && entityTypes && entityTypes.length > 0 && (
                <div className="px-spacing-4 py-spacing-3 border-b border-border-secondary">
                  <span className="font-code text-mono-xs text-text-disabled uppercase tracking-wider block mb-spacing-2">
                    ENTITY TYPES
                  </span>
                  <div className="flex flex-wrap gap-gap-sm">
                    {entityTypes.map((entityType) => (
                      <button
                        key={entityType.id}
                        onClick={() => {
                          const existingFilter = filters.find(f => f.field === 'entityType' && f.value === entityType.id);
                          const newFilters = existingFilter 
                            ? filters.filter(f => !(f.field === 'entityType' && f.value === entityType.id))
                            : [...filters, { field: 'entityType', operator: 'eq' as const, value: entityType.id }];
                          handleFilterChange(newFilters);
                        }}
                        className={clsx(
                          "flex items-center gap-gap-xs px-spacing-2 py-spacing-1 border-2 rounded-button transition-all duration-100",
                          filters.some(f => f.field === 'entityType' && f.value === entityType.id)
                            ? "border-primary-500 bg-primary-500 text-white"
                            : "border-border bg-surface-secondary text-text-primary hover:border-primary-500"
                        )}
                      >
                        {entityType.icon}
                        <span className="text-body-sm">{entityType.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Searches */}
              {!query && recentSearches && recentSearches.length > 0 && (
                <RecentSearches
                  searches={recentSearches}
                  onSelect={(searchQuery) => {
                    setQuery(searchQuery);
                    performSearch(searchQuery, filters);
                  }}
                  onClear={handleClearHistory}
                />
              )}

              {/* Saved Searches */}
              {!query && savedSearches && savedSearches.length > 0 && (
                <SavedSearches
                  searches={savedSearches}
                  onSelect={(savedSearch) => {
                    setQuery(savedSearch.query);
                    setFilters(savedSearch.filters);
                    performSearch(savedSearch.query, savedSearch.filters);
                  }}
                />
              )}

              {/* Search Results */}
              <SearchResults
                results={results}
                loading={loading}
                query={query}
                onSelect={handleResultSelect}
                selectedIndex={selectedIndex}
              />

              {/* Actions */}
              {query && (
                <div className="px-spacing-4 py-spacing-3 border-t border-border-secondary flex items-center justify-between">
                  <button
                    onClick={handleSaveSearch}
                    className="text-xs text-text-muted hover:text-text-primary transition-colors"
                  >
                    Save Search
                  </button>
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    );
  }
);

GlobalSearch.displayName = "GlobalSearch";
