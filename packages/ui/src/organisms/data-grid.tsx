"use client";

import React, { useState, useMemo, useCallback } from "react";
import clsx from "clsx";
import { Search, ChevronUp, ChevronDown, MoreVertical } from "lucide-react";

// Types
export interface DataGridColumn<T> {
  key: string;
  label: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  width?: string;
  minWidth?: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T) => React.ReactNode;
  hidden?: boolean;
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
  icon?: React.ReactNode;
  variant?: "default" | "danger";
  disabled?: boolean;
}

export interface RowAction<T> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "danger";
  disabled?: boolean | ((row: T) => boolean);
  hidden?: boolean | ((row: T) => boolean);
}

export interface DataGridProps<T> {
  data: T[];
  columns: DataGridColumn<T>[];
  rowKey: keyof T | ((row: T) => string);
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
  // Pagination
  pagination?: { page: number; pageSize: number; total: number };
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  // Column Management
  columnVisibility?: boolean;
  // States
  loading?: boolean;
  emptyMessage?: string;
  // Styling
  striped?: boolean;
  compact?: boolean;
  className?: string;
}

type SortDirection = "asc" | "desc" | null;

export function DataGrid<T>({
  data,
  columns,
  rowKey,
  searchable = false,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filters = [],
  activeFilters = {},
  onFilterChange,
  onClearFilters,
  sortable = true,
  defaultSort,
  onSortChange,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  bulkActions = [],
  onBulkAction,
  rowActions = [],
  onRowAction,
  onRowClick,
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  columnVisibility = false,
  loading = false,
  emptyMessage = "No data available",
  striped = false,
  compact = false,
  className = "",
}: DataGridProps<T>) {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [sortColumn, setSortColumn] = useState<string | null>(defaultSort?.column ?? null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSort?.direction ?? null);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  const getRowKey = useCallback((row: T): string => {
    if (typeof rowKey === "function") return rowKey(row);
    return String(row[rowKey]);
  }, [rowKey]);

  const getCellValue = useCallback((row: T, column: DataGridColumn<T>): unknown => {
    if (typeof column.accessor === "function") return column.accessor(row);
    return row[column.accessor];
  }, []);

  const visibleColumns = useMemo(() => 
    columns.filter(col => !col.hidden && !hiddenColumns.has(col.key)),
    [columns, hiddenColumns]
  );

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data;
    const column = columns.find(c => c.key === sortColumn);
    if (!column) return data;

    return [...data].sort((a, b) => {
      const aVal = getCellValue(a, column);
      const bVal = getCellValue(b, column);
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection, columns, getCellValue]);

  const handleSort = (columnKey: string) => {
    const column = columns.find(c => c.key === columnKey);
    if (!column?.sortable) return;

    let newDirection: SortDirection = "asc";
    if (sortColumn === columnKey) {
      if (sortDirection === "asc") newDirection = "desc";
      else if (sortDirection === "desc") newDirection = null;
    }

    setSortColumn(newDirection ? columnKey : null);
    setSortDirection(newDirection);
    onSortChange?.(columnKey, newDirection);
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (selectedKeys.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(getRowKey));
    }
  };

  const handleSelectRow = (key: string) => {
    if (!onSelectionChange) return;
    if (selectedKeys.includes(key)) {
      onSelectionChange(selectedKeys.filter(k => k !== key));
    } else {
      onSelectionChange([...selectedKeys, key]);
    }
  };

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    onSearchChange?.(value);
  };

  const activeFilterCount = Object.values(activeFilters).reduce((count, value) => {
    if (Array.isArray(value)) return count + value.length;
    return count + (value ? 1 : 0);
  }, 0);

  return (
    <div className={clsx("flex flex-col gap-gap-md", className)}>
      {/* Toolbar */}
      {(searchable || filters.length > 0 || columnVisibility) && (
        <div className="flex gap-gap-sm flex-wrap items-center">
          {searchable && (
            <div className="flex-1 min-w-card-sm relative">
              <input
                type="text"
                value={localSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className={clsx(
                  "w-full pl-spacing-10 bg-surface-primary border-2 border-border-primary text-text-primary outline-none",
                  compact ? "py-spacing-2 px-spacing-3 text-body-sm" : "py-spacing-3 px-spacing-4 text-body-md"
                )}
              />
              <span className="absolute left-spacing-3 top-1/2 -translate-y-1/2 text-grey-500"><Search className="size-4" /></span>
            </div>
          )}

          {filters.map((group) => (
            <div key={group.key} className="relative">
              <button
                onClick={() => setExpandedFilter(expandedFilter === group.key ? null : group.key)}
                className={clsx(
                  "font-code text-mono-sm tracking-wide uppercase border-2 border-black cursor-pointer",
                  compact ? "px-spacing-3 py-spacing-2" : "px-spacing-4 py-spacing-3",
                  activeFilters[group.key] ? "bg-surface-inverse text-text-inverse" : "bg-surface-primary text-text-primary"
                )}
              >
                {group.label} {expandedFilter === group.key ? <ChevronUp className="size-3 inline" /> : <ChevronDown className="size-3 inline" />}
              </button>
              {expandedFilter === group.key && (
                <div className="absolute top-full left-0 mt-spacing-1 min-w-container-sm max-h-container-lg overflow-y-auto bg-surface-elevated border-2 border-border-primary z-dropdown">
                  {group.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onFilterChange?.(group.key, option.value)}
                      className={clsx(
                        "block w-full px-spacing-4 py-spacing-3 font-body text-body-sm border-none border-b border-grey-200 cursor-pointer text-left hover:bg-grey-100",
                        activeFilters[group.key] === option.value ? "bg-surface-secondary" : "bg-surface-primary"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {activeFilterCount > 0 && (
            <button onClick={onClearFilters} className="px-spacing-2 py-spacing-1 font-code text-mono-xs bg-transparent text-grey-600 border-none cursor-pointer underline">
              CLEAR ALL ({activeFilterCount})
            </button>
          )}
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectable && selectedKeys.length > 0 && bulkActions.length > 0 && (
        <div className="flex items-center justify-between px-spacing-4 py-spacing-3 bg-black text-white">
          <span className="font-code text-mono-md">
            <strong>{selectedKeys.length}</strong> selected
            <button onClick={() => onSelectionChange?.([])} className="ml-spacing-4 px-spacing-2 py-spacing-1 bg-transparent text-grey-400 border-none cursor-pointer underline">Clear</button>
          </span>
          <div className="flex gap-gap-xs">
            {bulkActions.map((action) => (
              <button
                key={action.id}
                onClick={() => onBulkAction?.(action.id, selectedKeys)}
                disabled={action.disabled}
                className={clsx(
                  "px-spacing-3 py-spacing-2 font-code text-mono-sm border border-grey-600",
                  action.variant === "danger" ? "bg-white text-black" : "bg-grey-800 text-white",
                  action.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                )}
              >
                {action.icon} {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border-2 border-border-primary bg-surface-primary overflow-auto">
        <table className={clsx("w-full border-collapse font-body", compact ? "text-body-sm" : "text-body-md")}>
          <thead>
            <tr className="bg-black text-white">
              {selectable && (
                <th className={clsx("w-12 text-center", compact ? "px-spacing-3 py-spacing-2" : "px-spacing-4 py-spacing-3")}>
                  <input type="checkbox" checked={selectedKeys.length === data.length && data.length > 0} onChange={handleSelectAll} className="cursor-pointer" />
                </th>
              )}
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => sortable && handleSort(column.key)}
                  className={clsx(
                    "font-code text-mono-sm font-weight-normal tracking-widest uppercase select-none",
                    compact ? "px-spacing-3 py-spacing-2" : "px-spacing-4 py-spacing-3",
                    column.sortable ? "cursor-pointer" : "cursor-default",
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right",
                    !column.align && "text-left"
                  )}
                  style={{ width: column.width, minWidth: column.minWidth }}
                >
                  <span className="flex items-center gap-gap-xs">
                    {column.label}
                    {column.sortable && (
                      <span className="flex flex-col text-micro-xs leading-none">
                        <ChevronUp className={clsx("size-2", sortColumn === column.key && sortDirection === "asc" ? "opacity-100" : "opacity-30")} />
                        <ChevronDown className={clsx("size-2", sortColumn === column.key && sortDirection === "desc" ? "opacity-100" : "opacity-30")} />
                      </span>
                    )}
                  </span>
                </th>
              ))}
              {rowActions.length > 0 && <th className={clsx("w-spacing-14", compact ? "px-spacing-3 py-spacing-2" : "px-spacing-4 py-spacing-3")} />}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={visibleColumns.length + (selectable ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)} className="p-spacing-12 text-center">
                  <div className="inline-block w-spacing-6 h-spacing-6 border-2 border-grey-300 border-t-black rounded-full animate-spin" />
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + (selectable ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)} className="p-spacing-12 text-center font-code text-grey-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => {
                const key = getRowKey(row);
                const isSelected = selectedKeys.includes(key);
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(row)}
                    className={clsx(
                      "border-b border-grey-200 transition-colors duration-fast",
                      isSelected ? "bg-surface-secondary" : striped && index % 2 === 1 ? "bg-surface-secondary" : "bg-surface-primary",
                      onRowClick && "cursor-pointer hover:bg-grey-100"
                    )}
                  >
                    {selectable && (
                      <td className={clsx("text-center", compact ? "px-spacing-3 py-spacing-2" : "px-spacing-4 py-spacing-3")} onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={isSelected} onChange={() => handleSelectRow(key)} className="cursor-pointer" />
                      </td>
                    )}
                    {visibleColumns.map((column) => {
                      const value = getCellValue(row, column);
                      const rendered = column.render ? column.render(value, row) : value;
                      return (
                        <td
                          key={column.key}
                          className={clsx(
                            "text-text-secondary",
                            compact ? "px-spacing-3 py-spacing-2" : "px-spacing-4 py-spacing-3",
                            column.align === "center" && "text-center",
                            column.align === "right" && "text-right",
                            !column.align && "text-left"
                          )}
                        >
                          {rendered as React.ReactNode}
                        </td>
                      );
                    })}
                    {rowActions.length > 0 && (
                      <td className={clsx("text-center", compact ? "px-spacing-3 py-spacing-2" : "px-spacing-4 py-spacing-3")} onClick={(e) => e.stopPropagation()}>
                        <RowActionsDropdown row={row} actions={rowActions} onAction={onRowAction} />
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between flex-wrap gap-gap-md">
          <span className="font-code text-mono-sm text-grey-600">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
          </span>
          <div className="flex gap-gap-xs">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={clsx(
                "px-spacing-4 py-spacing-2 border-2 border-border-primary bg-surface-primary text-text-primary",
                pagination.page === 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-grey-100"
              )}
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page * pagination.pageSize >= pagination.total}
              className={clsx(
                "px-spacing-4 py-spacing-2 border-2 border-border-primary bg-surface-primary text-text-primary",
                pagination.page * pagination.pageSize >= pagination.total ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-grey-100"
              )}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline row actions dropdown
function RowActionsDropdown<T>({ row, actions, onAction }: { row: T; actions: RowAction<T>[]; onAction?: (id: string, row: T) => void }) {
  const [open, setOpen] = useState(false);
  const visibleActions = actions.filter(a => typeof a.hidden === "function" ? !a.hidden(row) : !a.hidden);
  if (visibleActions.length === 0) return null;

  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen(!open)} className="p-spacing-1 bg-transparent border-none cursor-pointer text-body-md hover:text-grey-600"><MoreVertical className="size-4" /></button>
      {open && (
        <div className="absolute top-full right-0 min-w-container-xs bg-surface-elevated border-2 border-border-primary z-dropdown">
          {visibleActions.map((action) => {
            const disabled = typeof action.disabled === "function" ? action.disabled(row) : action.disabled;
            return (
              <button
                key={action.id}
                onClick={() => { setOpen(false); onAction?.(action.id, row); }}
                disabled={disabled}
                className={clsx(
                  "block w-full px-spacing-3 py-spacing-2 text-left bg-surface-primary text-text-primary border-none border-b border-border-secondary hover:bg-surface-secondary",
                  disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                )}
              >
                {action.icon} {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DataGrid;
