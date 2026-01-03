"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import clsx from "clsx";
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
import { OverlayLayout } from "../templates/overlay-layout.js";

// =============================================================================
// TYPES
// =============================================================================

export interface SearchFilter {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "like" | "ilike" | "in" | "is" | "not";
  value: unknown;
  label?: string;
}

export interface SearchResult {
  id: string;
  entityType: string;
  entityId: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  score: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchFacet {
  field: string;
  label: string;
  values: Array<{ value: string; label: string; count: number }>;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilter[];
}

export interface GlobalSearchProps {
  /** Called when search is executed */
  onSearch?: (query: string, filters: SearchFilter[]) => Promise<{
    results: SearchResult[];
    total: number;
    facets?: SearchFacet[];
  }>;
  /** Called when a result is selected */
  onResultSelect?: (result: SearchResult) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Entity types to search */
  entityTypes?: Array<{ id: string; label: string; icon?: React.ReactNode }>;
  /** Saved searches */
  savedSearches?: SavedSearch[];
  /** Recent searches */
  recentSearches?: string[];
  /** Called to save a search */
  onSaveSearch?: (name: string, query: string, filters: SearchFilter[]) => void;
  /** Called to clear recent searches */
  onClearHistory?: () => void;
  /** Open state (controlled) */
  open?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Additional class name */
  className?: string;
}

// =============================================================================
// ENTITY TYPE ICONS
// =============================================================================

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

// =============================================================================
// SEARCH INPUT
// =============================================================================

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
      <Search className="absolute left-spacing-4 top-1/2 -translate-y-1/2 size-5 text-on-dark-muted" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={clsx(
          "w-full pl-spacing-12 pr-spacing-10 py-spacing-4",
          "bg-surface-primary border-b-2 border-border-primary",
          "text-body-lg text-text-primary placeholder:text-on-dark-muted",
          "outline-none focus:border-primary-500 transition-colors"
        )}
        autoFocus
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-spacing-4 top-1/2 -translate-y-1/2 p-spacing-1 text-on-dark-muted hover:text-on-dark-disabled bg-transparent border-none cursor-pointer"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

// =============================================================================
// FACET FILTERS
// =============================================================================

interface FacetFiltersProps {
  facets: SearchFacet[];
  activeFilters: SearchFilter[];
  onFilterToggle: (filter: SearchFilter) => void;
  onClearFilters: () => void;
}

function FacetFilters({ facets, activeFilters, onFilterToggle, onClearFilters }: FacetFiltersProps) {
  if (facets.length === 0) return null;

  return (
    <div className="border-r-2 border-border-primary p-spacing-4 w-container-sm overflow-y-auto">
      <div className="flex items-center justify-between mb-spacing-4">
        <span className="font-code text-mono-sm text-on-dark-disabled uppercase tracking-wider">Filters</span>
        {activeFilters.length > 0 && (
          <button
            onClick={onClearFilters}
            className="text-body-xs text-primary-500 hover:text-primary-600 bg-transparent border-none cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>
      
      {facets.map((facet) => (
        <div key={facet.field} className="mb-spacing-4">
          <p className="font-code text-mono-xs text-on-dark-disabled uppercase tracking-wider mb-spacing-2">
            {facet.label}
          </p>
          <div className="flex flex-col gap-gap-xs">
            {facet.values.map((item) => {
              const isActive = activeFilters.some(
                (f) => f.field === facet.field && f.value === item.value
              );
              return (
                <button
                  key={item.value}
                  onClick={() => onFilterToggle({ field: facet.field, operator: "eq", value: item.value, label: item.label })}
                  className={clsx(
                    "flex items-center justify-between px-spacing-3 py-spacing-2 rounded-button text-left border-none cursor-pointer transition-colors",
                    isActive
                      ? "bg-primary-500 text-white"
                      : "bg-surface-secondary text-text-primary hover:bg-surface-tertiary"
                  )}
                >
                  <span className="text-body-sm">{item.label}</span>
                  <span className={clsx(
                    "text-body-xs font-code",
                    isActive ? "text-white/70" : "text-on-light-muted"
                  )}>
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// SEARCH RESULTS
// =============================================================================

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
        <Search className="size-12 text-on-dark-secondary mb-spacing-4" />
        <p className="text-body-md text-on-dark-disabled">No results found for &quot;{query}&quot;</p>
        <p className="text-body-sm text-on-dark-muted mt-spacing-2">Try different keywords or filters</p>
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
            <span className="font-code text-mono-xs text-on-dark-disabled uppercase tracking-wider flex items-center gap-gap-xs">
              {entityIcons[entityType] || <FileText className="size-3" />}
              {entityType}
              <span className="text-on-dark-muted">({items.length})</span>
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
                      isSelected ? "text-white/70" : "text-on-light-muted"
                    )}>
                      {result.description}
                    </p>
                  )}
                </div>
                <ChevronRight className={clsx(
                  "size-4",
                  isSelected ? "text-white/70" : "text-on-light-muted"
                )} />
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// RECENT & SAVED SEARCHES
// =============================================================================

interface SearchSuggestionsProps {
  recentSearches: string[];
  savedSearches: SavedSearch[];
  onSelectRecent: (query: string) => void;
  onSelectSaved: (saved: SavedSearch) => void;
  onClearHistory: () => void;
}

function SearchSuggestions({ 
  recentSearches, 
  savedSearches, 
  onSelectRecent, 
  onSelectSaved,
  onClearHistory 
}: SearchSuggestionsProps) {
  return (
    <div className="p-spacing-4">
      {savedSearches.length > 0 && (
        <div className="mb-spacing-6">
          <p className="font-code text-mono-xs text-on-dark-disabled uppercase tracking-wider mb-spacing-2 flex items-center gap-gap-xs">
            <Star className="size-3" />
            Saved Searches
          </p>
          <div className="flex flex-col gap-gap-xs">
            {savedSearches.map((saved) => (
              <button
                key={saved.id}
                onClick={() => onSelectSaved(saved)}
                className="flex items-center gap-gap-sm px-spacing-3 py-spacing-2 bg-surface-secondary hover:bg-surface-tertiary rounded-button text-left border-none cursor-pointer transition-colors"
              >
                <Star className="size-4 text-accent-500" />
                <span className="text-body-sm text-text-primary">{saved.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {recentSearches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-spacing-2">
            <p className="font-code text-mono-xs text-on-dark-disabled uppercase tracking-wider flex items-center gap-gap-xs">
              <Clock className="size-3" />
              Recent Searches
            </p>
            <button
              onClick={onClearHistory}
              className="text-body-xs text-on-dark-disabled hover:text-on-dark-disabled bg-transparent border-none cursor-pointer"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-col gap-gap-xs">
            {recentSearches.map((query, index) => (
              <button
                key={index}
                onClick={() => onSelectRecent(query)}
                className="flex items-center gap-gap-sm px-spacing-3 py-spacing-2 bg-surface-secondary hover:bg-surface-tertiary rounded-button text-left border-none cursor-pointer transition-colors"
              >
                <Clock className="size-4 text-on-dark-muted" />
                <span className="text-body-sm text-text-primary">{query}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {savedSearches.length === 0 && recentSearches.length === 0 && (
        <div className="flex flex-col items-center justify-center py-spacing-8 text-center">
          <Search className="size-10 text-on-dark-secondary mb-spacing-4" />
          <p className="text-body-md text-on-dark-disabled">Start typing to search</p>
          <p className="text-body-sm text-on-dark-muted mt-spacing-1">
            Search across projects, contacts, events, and more
          </p>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// GLOBAL SEARCH COMPONENT
// =============================================================================

export function GlobalSearch({
  onSearch,
  onResultSelect,
  placeholder = "Search everything...",
  savedSearches = [],
  recentSearches = [],
  onSaveSearch,
  onClearHistory,
  open = false,
  onOpenChange,
  className,
}: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [facets, setFacets] = useState<SearchFacet[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Execute search
  const executeSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilter[]) => {
    if (!onSearch || !searchQuery.trim()) {
      setResults([]);
      setFacets([]);
      return;
    }

    setLoading(true);
    try {
      const response = await onSearch(searchQuery, searchFilters);
      setResults(response.results);
      setFacets(response.facets || []);
      setSelectedIndex(0);
    } catch {
      setResults([]);
      setFacets([]);
    } finally {
      setLoading(false);
    }
  }, [onSearch]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      executeSearch(query, filters);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, filters, executeSearch]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            onResultSelect?.(results[selectedIndex]);
            onOpenChange?.(false);
          }
          break;
        case "Escape":
          e.preventDefault();
          onOpenChange?.(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, results, selectedIndex, onResultSelect, onOpenChange]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Handle filter toggle
  const handleFilterToggle = useCallback((filter: SearchFilter) => {
    setFilters((prev) => {
      const exists = prev.some((f) => f.field === filter.field && f.value === filter.value);
      if (exists) {
        return prev.filter((f) => !(f.field === filter.field && f.value === filter.value));
      }
      return [...prev, filter];
    });
  }, []);

  // Handle result selection
  const handleResultSelect = useCallback((result: SearchResult) => {
    onResultSelect?.(result);
    onOpenChange?.(false);
  }, [onResultSelect, onOpenChange]);

  // Handle saved search selection
  const handleSavedSearchSelect = useCallback((saved: SavedSearch) => {
    setQuery(saved.query);
    setFilters(saved.filters);
  }, []);

  // Clear search
  const handleClear = useCallback(() => {
    setQuery("");
    setFilters([]);
    setResults([]);
    setFacets([]);
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  // Custom header with search input
  const headerContent = (
    <>
      <SearchInput
        value={query}
        onChange={setQuery}
        onClear={handleClear}
        placeholder={placeholder}
        inputRef={inputRef as React.RefObject<HTMLInputElement>}
      />
      
      {/* Active Filters */}
      {filters.length > 0 && (
        <div className="flex items-center gap-1 px-4 py-2 bg-muted border-b border-border overflow-x-auto">
          <Filter className="size-4 text-on-light-muted flex-shrink-0" />
          {filters.map((filter, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary-500 text-white rounded-badge text-xs font-mono"
            >
              {filter.label || `${filter.field}: ${filter.value}`}
              <button
                onClick={() => handleFilterToggle(filter)}
                className="p-0 bg-transparent border-none cursor-pointer text-white/70 hover:text-white"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </>
  );

  // Footer with keyboard hints
  const footerContent = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4 text-xs text-on-light-muted">
        <span className="flex items-center gap-1">
          <kbd className="px-1 py-px bg-muted rounded-badge font-mono">↑↓</kbd>
          Navigate
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1 py-px bg-muted rounded-badge font-mono">↵</kbd>
          Select
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1 py-px bg-muted rounded-badge font-mono">esc</kbd>
          Close
        </span>
      </div>
      <div className="flex items-center gap-2">
        {facets.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              "flex items-center gap-1 px-2 py-1 rounded-button text-xs border-none cursor-pointer transition-colors",
              showFilters
                ? "bg-primary-500 text-white"
                : "bg-muted text-on-light-muted hover:bg-surface-elevated"
            )}
          >
            <Filter className="size-3" />
            Filters
          </button>
        )}
        {onSaveSearch && query && (
          <button
            onClick={() => onSaveSearch("New Search", query, filters)}
            className="flex items-center gap-1 px-2 py-1 bg-muted text-on-light-muted hover:bg-surface-elevated rounded-button text-xs border-none cursor-pointer transition-colors"
          >
            <Star className="size-3" />
            Save
          </button>
        )}
      </div>
    </div>
  );

  return (
    <OverlayLayout
      type="modal"
      size="lg"
      open={open}
      onClose={handleClose}
      closeOnEscape={false}
      closeOnBackdrop
      preventScroll
      animation="scale"
      inverted={false}
      showClose={false}
      headerContent={headerContent}
      footerContent={footerContent}
      className={className}
      ariaLabel="Global Search"
      contentClassName="p-0"
      mobileType="fullscreen"
    >
      {/* Content */}
      <div className="flex max-h-96">
        {/* Facet Filters (shown when there are results) */}
        {showFilters && facets.length > 0 && (
          <FacetFilters
            facets={facets}
            activeFilters={filters}
            onFilterToggle={handleFilterToggle}
            onClearFilters={() => setFilters([])}
          />
        )}
        
        {/* Results or Suggestions */}
        <div className="flex-1 overflow-hidden">
          {query ? (
            <SearchResults
              results={results}
              loading={loading}
              query={query}
              onSelect={handleResultSelect}
              selectedIndex={selectedIndex}
            />
          ) : (
            <SearchSuggestions
              recentSearches={recentSearches}
              savedSearches={savedSearches}
              onSelectRecent={setQuery}
              onSelectSaved={handleSavedSearchSelect}
              onClearHistory={onClearHistory || (() => {})}
            />
          )}
        </div>
      </div>
    </OverlayLayout>
  );
}

export default GlobalSearch;
