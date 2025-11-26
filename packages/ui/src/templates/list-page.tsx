"use client";

import React, { useState, useCallback } from "react";
import clsx from "clsx";

export interface ListPageColumn<T> {
  key: string;
  label: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface ListPageFilter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  multiple?: boolean;
}

export interface ListPageAction<T> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "danger";
  onClick: (row: T) => void;
}

export interface ListPageBulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "danger";
}

export interface ListPageProps<T> {
  /** Page title */
  title: string;
  /** Page subtitle/description */
  subtitle?: string;
  /** Data array */
  data: T[];
  /** Column definitions */
  columns: ListPageColumn<T>[];
  /** Row key accessor */
  rowKey: keyof T | ((row: T) => string);
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Retry handler */
  onRetry?: () => void;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Filter definitions */
  filters?: ListPageFilter[];
  /** Row actions */
  rowActions?: ListPageAction<T>[];
  /** Bulk actions */
  bulkActions?: ListPageBulkAction[];
  /** Bulk action handler */
  onBulkAction?: (actionId: string, selectedIds: string[]) => void;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Create button label */
  createLabel?: string;
  /** Create handler */
  onCreate?: () => void;
  /** Import handler */
  onImport?: () => void;
  /** Export handler */
  onExport?: () => void;
  /** Stats to display */
  stats?: Array<{ label: string; value: string | number }>;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state action */
  emptyAction?: { label: string; onClick: () => void };
  /** Header content (navigation, etc.) */
  header?: React.ReactNode;
  /** Custom className */
  className?: string;
}

export function ListPage<T>({
  title,
  subtitle,
  data,
  columns,
  rowKey,
  loading = false,
  error,
  onRetry,
  searchPlaceholder = "Search...",
  filters = [],
  rowActions = [],
  bulkActions = [],
  onBulkAction,
  onRowClick,
  createLabel = "Create New",
  onCreate,
  onImport,
  onExport,
  stats = [],
  emptyMessage = "No records found",
  emptyAction,
  header,
  className = "",
}: ListPageProps<T>) {
  const [searchValue, setSearchValue] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string | string[]>>({});
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  const getRowKey = useCallback((row: T): string => {
    if (typeof rowKey === "function") return rowKey(row);
    return String(row[rowKey]);
  }, [rowKey]);

  // Filter and search data
  const filteredData = React.useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      result = result.filter(row => {
        return columns.some(col => {
          const value = typeof col.accessor === "function" 
            ? col.accessor(row) 
            : row[col.accessor];
          return String(value || "").toLowerCase().includes(searchLower);
        });
      });
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return;
      result = result.filter(row => {
        const rowValue = (row as Record<string, unknown>)[key];
        if (Array.isArray(value)) {
          return value.includes(String(rowValue));
        }
        return String(rowValue) === value;
      });
    });

    // Apply sorting
    if (sortColumn && sortDirection) {
      const col = columns.find(c => c.key === sortColumn);
      if (col) {
        result.sort((a, b) => {
          const aVal = typeof col.accessor === "function" ? col.accessor(a) : a[col.accessor];
          const bVal = typeof col.accessor === "function" ? col.accessor(b) : b[col.accessor];
          if (aVal === bVal) return 0;
          if (aVal === null || aVal === undefined) return 1;
          if (bVal === null || bVal === undefined) return -1;
          const cmp = aVal < bVal ? -1 : 1;
          return sortDirection === "asc" ? cmp : -cmp;
        });
      }
    }

    return result;
  }, [data, searchValue, activeFilters, sortColumn, sortDirection, columns]);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      if (sortDirection === "asc") setSortDirection("desc");
      else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = () => {
    if (selectedKeys.length === filteredData.length) {
      setSelectedKeys([]);
    } else {
      setSelectedKeys(filteredData.map(getRowKey));
    }
  };

  const handleSelectRow = (key: string) => {
    setSelectedKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters(prev => ({ ...prev, [key]: value === "All" ? "" : value }));
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchValue("");
  };

  const activeFilterCount = Object.values(activeFilters).filter(v => v && (Array.isArray(v) ? v.length > 0 : true)).length;

  // Error state
  if (error) {
    return (
      <div className={clsx("min-h-screen bg-black text-white", className)}>
        {header}
        <div className="px-8 py-16 text-center">
          <h2 className="font-heading text-h3-md mb-4">Error Loading Data</h2>
          <p className="font-body text-grey-400 mb-8">{error.message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-3 font-heading text-body-md tracking-wider uppercase bg-white text-black border-2 border-white cursor-pointer hover:bg-grey-100"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className={clsx("min-h-screen bg-black text-white", className)}>
        {header}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-[3px] border-grey-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="font-code text-mono-md text-grey-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("min-h-screen bg-black text-white", className)}>
      {header}
      
      <div className="p-8 max-w-[1400px] mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-display text-h1-sm tracking-tight">{title}</h1>
            <div className="flex gap-3">
              {onImport && (
                <button onClick={onImport} className="px-4 py-2 font-code text-mono-sm bg-transparent text-grey-400 border border-grey-700 cursor-pointer hover:border-grey-500">
                  ⬆️ Import
                </button>
              )}
              {onExport && (
                <button onClick={onExport} className="px-4 py-2 font-code text-mono-sm bg-transparent text-grey-400 border border-grey-700 cursor-pointer hover:border-grey-500">
                  ⬇️ Export
                </button>
              )}
              {onCreate && (
                <button onClick={onCreate} className="px-6 py-3 font-heading text-body-md tracking-wider uppercase bg-white text-black border-2 border-white cursor-pointer hover:bg-grey-100">
                  + {createLabel}
                </button>
              )}
            </div>
          </div>
          {subtitle && (
            <p className="font-body text-body-md text-grey-400">{subtitle}</p>
          )}
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div className={clsx("grid gap-4 mb-8", stats.length <= 2 ? "grid-cols-2" : stats.length === 3 ? "grid-cols-3" : "grid-cols-4")}>
            {stats.map((stat, idx) => (
              <div key={idx} className="p-6 border border-grey-800 bg-black">
                <div className="font-display text-h2-sm text-white">{stat.value}</div>
                <div className="font-code text-mono-sm text-grey-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="flex-[1_1_300px] relative">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full py-3 px-4 pl-10 font-body text-body-md bg-black text-white border border-grey-700 outline-none focus:border-grey-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-500">🔍</span>
          </div>
          {filters.map(filter => (
            <select
              key={filter.key}
              value={String(activeFilters[filter.key] || "All")}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="px-4 py-3 font-body text-body-md bg-black text-white border border-grey-700"
            >
              <option value="All">{filter.label}: All</option>
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ))}
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="px-4 py-3 font-code text-mono-sm bg-transparent text-grey-400 border-none cursor-pointer underline">
              Clear ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Bulk Action Bar */}
        {selectedKeys.length > 0 && bulkActions.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-white text-black mb-4">
            <span className="font-code text-mono-md">
              <strong>{selectedKeys.length}</strong> selected
              <button onClick={() => setSelectedKeys([])} className="ml-4 bg-transparent border-none text-grey-600 cursor-pointer underline">Clear</button>
            </span>
            <div className="flex gap-2">
              {bulkActions.map(action => (
                <button
                  key={action.id}
                  onClick={() => onBulkAction?.(action.id, selectedKeys)}
                  className={clsx(
                    "px-3 py-2 font-code text-mono-sm border-none cursor-pointer",
                    action.variant === "danger" ? "bg-grey-100 text-grey-700" : "bg-grey-800 text-white"
                  )}
                >
                  {action.icon} {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="mb-4 font-code text-mono-sm text-grey-500">
          {filteredData.length} {filteredData.length === 1 ? "result" : "results"}
        </div>

        {/* Table */}
        {filteredData.length === 0 ? (
          <div className="text-center px-8 py-16 border border-grey-800">
            <h3 className="font-heading text-h4-md text-grey-500 mb-2">{emptyMessage}</h3>
            {emptyAction && (
              <button onClick={emptyAction.onClick} className="mt-4 px-6 py-3 font-heading text-body-md tracking-wider uppercase bg-white text-black border-2 border-white cursor-pointer hover:bg-grey-100">
                {emptyAction.label}
              </button>
            )}
          </div>
        ) : (
          <div className="border border-grey-800 overflow-auto">
            <table className="w-full border-collapse font-body text-body-md">
              <thead>
                <tr className="bg-grey-900">
                  {bulkActions.length > 0 && (
                    <th className="px-4 py-3.5 w-12 text-center">
                      <input type="checkbox" checked={selectedKeys.length === filteredData.length && filteredData.length > 0} onChange={handleSelectAll} className="cursor-pointer" />
                    </th>
                  )}
                  {columns.map(col => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable && handleSort(col.key)}
                      className={clsx(
                        "px-4 py-3.5 text-left font-code text-mono-sm font-normal tracking-widest uppercase text-grey-400",
                        col.sortable && "cursor-pointer"
                      )}
                      style={{ width: col.width }}
                    >
                      <span className="flex items-center gap-2">
                        {col.label}
                        {col.sortable && (
                          <span className={clsx("text-[8px]", sortColumn === col.key ? "opacity-100" : "opacity-30")}>
                            {sortColumn === col.key && sortDirection === "asc" ? "▲" : sortColumn === col.key && sortDirection === "desc" ? "▼" : "▲▼"}
                          </span>
                        )}
                      </span>
                    </th>
                  ))}
                  {rowActions.length > 0 && <th className="px-4 py-3.5 w-[60px]" />}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row) => {
                  const key = getRowKey(row);
                  const isSelected = selectedKeys.includes(key);
                  return (
                    <tr
                      key={key}
                      onClick={() => onRowClick?.(row)}
                      className={clsx(
                        "border-b border-grey-800 transition-colors duration-fast",
                        isSelected ? "bg-grey-900" : "bg-transparent",
                        onRowClick && "cursor-pointer hover:bg-grey-900"
                      )}
                    >
                      {bulkActions.length > 0 && (
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={isSelected} onChange={() => handleSelectRow(key)} className="cursor-pointer" />
                        </td>
                      )}
                      {columns.map(col => {
                        const value = typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor];
                        const rendered = col.render ? col.render(value, row) : value;
                        return (
                          <td key={col.key} className="px-4 py-3 text-grey-300">
                            {rendered as React.ReactNode}
                          </td>
                        );
                      })}
                      {rowActions.length > 0 && (
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <RowActionsMenu row={row} actions={rowActions} />
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Inline row actions menu
function RowActionsMenu<T>({ row, actions }: { row: T; actions: ListPageAction<T>[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen(!open)} className="p-1 bg-transparent border-none cursor-pointer text-grey-400 text-base hover:text-grey-300">⋮</button>
      {open && (
        <div className="absolute top-full right-0 min-w-[140px] bg-grey-900 border border-grey-700 z-dropdown">
          {actions.map(action => (
            <button
              key={action.id}
              onClick={() => { setOpen(false); action.onClick(row); }}
              className={clsx(
                "block w-full px-3 py-2 text-left font-body text-body-sm bg-transparent border-none border-b border-grey-800 cursor-pointer hover:bg-grey-800",
                action.variant === "danger" ? "text-grey-400" : "text-grey-300"
              )}
            >
              {action.icon} {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ListPage;
