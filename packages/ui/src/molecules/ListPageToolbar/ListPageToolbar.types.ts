import type { ReactNode } from "react";

/**
 * Density mode options
 */
export type DensityMode = 
  | "compact"
  | "default"
  | "relaxed";

/**
 * View icon type options
 */
export type ViewIconType = 
  | "list"
  | "grid"
  | "kanban"
  | "calendar"
  | "gantt"
  | "table"
  | "timeline"
  | "map"
  | "gallery";

/**
 * View configuration
 */
export interface ViewConfig {
  id: string;
  label: string;
  icon: ViewIconType;
}

/**
 * Column configuration
 */
export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  locked?: boolean;
}

/**
 * Filter option
 */
export interface FilterOption {
  value: string;
  label: string;
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

/**
 * Quick action configuration
 */
export interface QuickAction {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

/**
 * ListPageToolbar component props
 */
export interface ListPageToolbarProps {
  title: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  activeFilters?: Record<string, string | string[]>;
  onFilterChange?: (key: string, value: string) => void;
  activeFilterCount?: number;
  onClearFilters?: () => void;
  views?: ViewConfig[];
  activeView?: string;
  onViewChange?: (viewId: string) => void;
  columns?: ColumnConfig[];
  onColumnsChange?: (columns: ColumnConfig[]) => void;
  density?: DensityMode;
  onDensityChange?: (density: DensityMode) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onImport?: () => void;
  onExport?: () => void;
  onCreate?: () => void;
  createLabel?: string;
  quickActions?: QuickAction[];
  savedFiltersSlot?: ReactNode;
  inverted?: boolean;
  className?: string;
}
