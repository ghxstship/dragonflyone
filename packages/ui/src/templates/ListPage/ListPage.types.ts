import type { ReactNode } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';

export type ViewIconType = "list" | "grid" | "kanban" | "calendar" | "gantt" | "table" | "timeline" | "map" | "gallery";

export interface ViewConfig {
  id: string;
  label: string;
  icon: ViewIconType;
}

export interface ListPageColumn<T = unknown> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => unknown);
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, row: T) => ReactNode;
}

export interface ListPageAction<T = unknown> {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: (items: T[]) => void;
  disabled?: boolean | ((items: T[]) => boolean);
  variant?: "default" | "danger";
}

export interface ListPageProps<T = unknown> {
  /** Data items to display */
  items: T[];
  /** Column definitions */
  columns: ListPageColumn<T>[];
  /** Available views */
  views?: ViewConfig[];
  /** Default view */
  defaultView?: ViewIconType;
  /** Bulk actions */
  bulkActions?: ListPageAction<T>[];
  /** Primary actions */
  primaryActions?: ListPageAction<T>[];
  /** Secondary actions */
  secondaryActions?: ListPageAction<T>[];
  /** Loading state */
  loading?: boolean;
  /** Empty state */
  emptyState?: ReactNode;
  /** Error state */
  errorState?: ReactNode;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Enable search */
  enableSearch?: boolean;
  /** Enable filters */
  enableFilters?: boolean;
  /** Enable import/export */
  enableImportExport?: boolean;
  /** Enable drag and drop */
  enableDragDrop?: boolean;
  /** Drag end handler */
  onDragEnd?: (event: DragEndEvent) => void;
  /** Selection change handler */
  onSelectionChange?: (selectedItems: T[]) => void;
  /** View change handler */
  onViewChange?: (view: ViewIconType) => void;
  /** Search handler */
  onSearch?: (query: string) => void;
  /** Filter handler */
  onFilter?: (filters: Record<string, unknown>) => void;
  /** Pagination */
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  /** Enable capability detection */
  enableCapabilityDetection?: boolean;
  /** Capability base path */
  capabilityBasePath?: string;
  /** Scan action handler */
  onScanAction?: (capability: string, route: string) => void;
  /** Additional className */
  className?: string;
}
