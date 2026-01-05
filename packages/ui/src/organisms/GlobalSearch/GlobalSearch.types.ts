import type { ReactNode } from "react";

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
  entityTypes?: Array<{ id: string; label: string; icon?: ReactNode }>;
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
