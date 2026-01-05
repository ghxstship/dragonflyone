/**
 * Filter option
 */
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

/**
 * Filter group
 */
export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
  multiple?: boolean;
}

/**
 * Filter preset
 */
export interface FilterPreset {
  id: string;
  name: string;
  filters: Record<string, string | string[]>;
  searchValue?: string;
}

/**
 * SearchFilter component props
 */
export interface SearchFilterProps {
  /** Search placeholder text */
  placeholder?: string;
  /** Search value */
  searchValue?: string;
  /** Search change handler */
  onSearchChange?: (value: string) => void;
  /** Filter groups */
  filters?: FilterGroup[];
  /** Active filter values */
  activeFilters?: Record<string, string | string[]>;
  /** Filter change handler */
  onFilterChange?: (key: string, value: string | string[]) => void;
  /** Clear all filters handler */
  onClearAll?: () => void;
  /** Debounce delay for search (ms) */
  debounceMs?: number;
  /** Show filter count badges */
  showCounts?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Saved filter presets */
  presets?: FilterPreset[];
  /** Preset selection handler */
  onPresetSelect?: (preset: FilterPreset) => void;
  /** Theme inversion */
  inverted?: boolean;
  /** Custom className */
  className?: string;
}
