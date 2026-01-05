import type { ReactNode } from "react";

/** Status variant for badge colors (SSOT) */
export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'ghost' | 'outline';

export interface DataGridColumn<T> {
  key: string;
  label: string;
  /** Field accessor - keyof T, string key, or function (compatible with entity registry) */
  accessor: keyof T | string | ((row: T) => ReactNode) | ((row: T) => unknown);
  /** Optional computed value that overrides accessor for rendering and sorting */
  formula?: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  minWidth?: string;
  /** Maximum width (for entity registry compatibility) */
  maxWidth?: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T) => ReactNode;
  hidden?: boolean;
  /** Whether column can be hidden by user (for entity registry compatibility) */
  hideable?: boolean;
  /** Column group for organization (for entity registry compatibility) */
  group?: string;
  /** Cell class name (for entity registry compatibility) */
  className?: string;
  /** Header class name (for entity registry compatibility) */
  headerClassName?: string;
  editable?: boolean;
  editorType?: "text" | "number" | "select" | "date" | "checkbox" | "linked-record";
  editorOptions?: { value: string; label: string }[];
  validate?: (value: unknown, row: T) => string | null;
  linkedOptions?: { value: string; label: string; subtitle?: string }[];
  /** Data type for automatic formatting (SSOT) - includes avatar/link for entity registry */
  dataType?: 'string' | 'number' | 'currency' | 'date' | 'datetime' | 'boolean' | 'status' | 'badge' | 'avatar' | 'link';
  /** Format options for dataType */
  formatOptions?: {
    currency?: string;
    dateFormat?: string;
    locale?: string;
    precision?: number;
    prefix?: string;
    suffix?: string;
  };
  /** Status color mapping for status/badge dataType (SSOT) */
  statusColors?: Record<string, StatusVariant>;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: { value: string; label: string; count?: number }[];
  multiple?: boolean;
}

export interface BulkAction {
  id: string;
  label: string;
  icon?: ReactNode;
  variant?: "default" | "danger";
  disabled?: boolean;
}

export interface RowAction<T> {
  id: string;
  label: string;
  icon?: ReactNode;
  variant?: "default" | "danger";
  disabled?: boolean | ((row: T) => boolean);
  hidden?: boolean | ((row: T) => boolean);
}

export interface DataGridProps<T> {
  data: T[];
  columns: DataGridColumn<T>[];
  rowKey: keyof T | ((row: T) => string);
  // Grouping
  groupBy?: (row: T) => string | null;
  groupLabel?: (groupKey: string | null) => ReactNode;
  defaultCollapsedGroups?: string[];
  // Conditional formatting
  conditionalFormatting?: Array<{
    columnKey?: string;
    predicate: (row: T) => boolean;
    className?: string;
  }>;
  // Search
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  // Filters
  filters?: FilterGroup[];
  activeFilters?: Record<string, string | string[]>;
  onFilterChange?: (key: string, value: string | string[]) => void;
  onClearFilters?: () => void;
  // Sorting
  sortable?: boolean;
  defaultSort?: { column: string; direction: "asc" | "desc" };
  onSortChange?: (column: string, direction: "asc" | "desc" | null) => void;
  // Selection
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  // Bulk Actions
  bulkActions?: BulkAction[];
  onBulkAction?: (actionId: string, selectedIds: string[]) => void;
  // Row Actions
  rowActions?: RowAction<T>[];
  onRowAction?: (actionId: string, row: T) => void;
  onRowClick?: (row: T) => void;
  // Pagination (controlled)
  pagination?: { page: number; pageSize: number; total: number };
  onPageChange?: (page: number) => void;
  // Column visibility toggle UI
  columnVisibility?: boolean;
  // States
  loading?: boolean;
  emptyMessage?: string;
  // Styling
  striped?: boolean;
  compact?: boolean;
  /** Row density mode - overrides compact if provided */
  density?: "compact" | "default" | "relaxed";
  className?: string;
  // Inline Editing
  inlineEditing?: boolean;
  onMapLocationClick?: (item: T) => void;
  galleryImageField?: keyof T;
  galleryThumbnailField?: keyof T;
  onGalleryItemClick?: (item: T) => void;
  onCellEdit?: (row: T, columnKey: string, newValue: unknown) => Promise<void>;
  onEditSnapshot?: (payload: { row: T; columnKey: string; previous: unknown; next: unknown }) => void;
}
