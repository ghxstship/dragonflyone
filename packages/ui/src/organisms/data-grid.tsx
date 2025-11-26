"use client";

import React, { useState, useMemo, useCallback } from "react";
import clsx from "clsx";

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
    <div className={clsx("flex flex-col gap-4", className)}>
      {/* Toolbar */}
      {(searchable || filters.length > 0 || columnVisibility) && (
        <div className="flex gap-3 flex-wrap items-center">
          {searchable && (
            <div className="flex-[1_1_300px] relative">
              <input
                type="text"
                value={localSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className={clsx(
                  "w-full pl-10 bg-white border-2 border-black outline-none",
                  compact ? "py-2 px-3 text-body-sm" : "py-3 px-4 text-body-md"
                )}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-500">🔍</span>
            </div>
          )}

          {filters.map((group) => (
            <div key={group.key} className="relative">
              <button
                onClick={() => setExpandedFilter(expandedFilter === group.key ? null : group.key)}
                className={clsx(
                  "font-code text-mono-sm tracking-wide uppercase border-2 border-black cursor-pointer",
                  compact ? "px-3 py-2" : "px-4 py-3",
                  activeFilters[group.key] ? "bg-black text-white" : "bg-white text-black"
                )}
              >
                {group.label} {expandedFilter === group.key ? "▲" : "▼"}
              </button>
              {expandedFilter === group.key && (
                <div className="absolute top-full left-0 mt-1 min-w-[200px] max-h-[300px] overflow-y-auto bg-white border-2 border-black z-dropdown">
                  {group.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onFilterChange?.(group.key, option.value)}
                      className={clsx(
                        "block w-full px-4 py-3 font-body text-body-sm border-none border-b border-grey-200 cursor-pointer text-left hover:bg-grey-100",
                        activeFilters[group.key] === option.value ? "bg-grey-100" : "bg-white"
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
            <button onClick={onClearFilters} className="px-2 py-1 font-code text-mono-xs bg-transparent text-grey-600 border-none cursor-pointer underline">
              CLEAR ALL ({activeFilterCount})
            </button>
          )}
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectable && selectedKeys.length > 0 && bulkActions.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-black text-white">
          <span className="font-code text-mono-md">
            <strong>{selectedKeys.length}</strong> selected
            <button onClick={() => onSelectionChange?.([])} className="ml-4 px-2 py-1 bg-transparent text-grey-400 border-none cursor-pointer underline">Clear</button>
          </span>
          <div className="flex gap-2">
            {bulkActions.map((action) => (
              <button
                key={action.id}
                onClick={() => onBulkAction?.(action.id, selectedKeys)}
                disabled={action.disabled}
                className={clsx(
                  "px-3 py-2 font-code text-mono-sm border border-grey-600",
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
      <div className="border-2 border-black bg-white overflow-auto">
        <table className={clsx("w-full border-collapse font-body", compact ? "text-body-sm" : "text-body-md")}>
          <thead>
            <tr className="bg-black text-white">
              {selectable && (
                <th className={clsx("w-12 text-center", compact ? "px-3 py-2.5" : "px-4 py-3.5")}>
                  <input type="checkbox" checked={selectedKeys.length === data.length && data.length > 0} onChange={handleSelectAll} className="cursor-pointer" />
                </th>
              )}
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => sortable && handleSort(column.key)}
                  className={clsx(
                    "font-code text-mono-sm font-normal tracking-widest uppercase select-none",
                    compact ? "px-3 py-2.5" : "px-4 py-3.5",
                    column.sortable ? "cursor-pointer" : "cursor-default",
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right",
                    !column.align && "text-left"
                  )}
                  style={{ width: column.width, minWidth: column.minWidth }}
                >
                  <span className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && (
                      <span className="flex flex-col text-[8px] leading-none">
                        <span className={sortColumn === column.key && sortDirection === "asc" ? "opacity-100" : "opacity-30"}>▲</span>
                        <span className={sortColumn === column.key && sortDirection === "desc" ? "opacity-100" : "opacity-30"}>▼</span>
                      </span>
                    )}
                  </span>
                </th>
              ))}
              {rowActions.length > 0 && <th className={clsx("w-[60px]", compact ? "px-3 py-2.5" : "px-4 py-3.5")} />}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={visibleColumns.length + (selectable ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)} className="p-12 text-center">
                  <div className="inline-block w-6 h-6 border-2 border-grey-300 border-t-black rounded-full animate-spin" />
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + (selectable ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)} className="p-12 text-center font-code text-grey-500">
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
                      isSelected ? "bg-grey-100" : striped && index % 2 === 1 ? "bg-grey-100" : "bg-white",
                      onRowClick && "cursor-pointer hover:bg-grey-100"
                    )}
                  >
                    {selectable && (
                      <td className={clsx("text-center", compact ? "px-3 py-2" : "px-4 py-3")} onClick={(e) => e.stopPropagation()}>
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
                            "text-grey-800",
                            compact ? "px-3 py-2" : "px-4 py-3",
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
                      <td className={clsx("text-center", compact ? "px-3 py-2" : "px-4 py-3")} onClick={(e) => e.stopPropagation()}>
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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <span className="font-code text-mono-sm text-grey-600">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={clsx(
                "px-4 py-2 border-2 border-black bg-white",
                pagination.page === 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-grey-100"
              )}
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page * pagination.pageSize >= pagination.total}
              className={clsx(
                "px-4 py-2 border-2 border-black bg-white",
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
      <button onClick={() => setOpen(!open)} className="p-1 bg-transparent border-none cursor-pointer text-base hover:text-grey-600">⋮</button>
      {open && (
        <div className="absolute top-full right-0 min-w-[140px] bg-white border-2 border-black z-dropdown">
          {visibleActions.map((action) => {
            const disabled = typeof action.disabled === "function" ? action.disabled(row) : action.disabled;
            return (
              <button
                key={action.id}
                onClick={() => { setOpen(false); onAction?.(action.id, row); }}
                disabled={disabled}
                className={clsx(
                  "block w-full px-3 py-2 text-left bg-white border-none border-b border-grey-200 hover:bg-grey-100",
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
