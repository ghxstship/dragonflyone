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
  /** Inverted theme (dark background) - defaults to true for dark-first design */
  inverted?: boolean;
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
  inverted = true,
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

  // Theme-aware classes - Bold Contemporary Pop Art Adventure
  const bgClass = inverted ? "bg-black text-white" : "bg-white text-black";
  const borderClass = inverted ? "border-grey-700" : "border-grey-300";
  const mutedTextClass = inverted ? "text-grey-400" : "text-grey-600";
  const primaryBtnClass = inverted
    ? "bg-white text-black border-2 border-white shadow-[3px_3px_0_hsl(239,84%,67%)] hover:shadow-[4px_4px_0_hsl(239,84%,67%)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 rounded-[var(--radius-button)]"
    : "bg-black text-white border-2 border-black shadow-[3px_3px_0_hsl(239,84%,67%)] hover:shadow-[4px_4px_0_hsl(239,84%,67%)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 rounded-[var(--radius-button)]";
  const secondaryBtnClass = inverted
    ? "bg-transparent text-grey-400 border-2 border-grey-700 hover:border-grey-500 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 rounded-[var(--radius-button)]"
    : "bg-transparent text-grey-600 border-2 border-grey-300 hover:border-grey-500 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 rounded-[var(--radius-button)]";

  // Error state
  if (error) {
    return (
      <div className={clsx("min-h-screen", bgClass, className)}>
        {header}
        <div className="px-spacing-8 py-spacing-16 text-center">
          <h2 className="font-heading text-h3-md mb-spacing-4">Error Loading Data</h2>
          <p className={clsx("font-body mb-spacing-8", mutedTextClass)}>{error.message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className={clsx("px-spacing-6 py-spacing-3 font-heading text-body-md tracking-wider uppercase cursor-pointer", primaryBtnClass)}
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
      <div className={clsx("min-h-screen", bgClass, className)}>
        {header}
        <div className="flex items-center justify-center min-h-screen-60">
          <div className="text-center">
            <div className={clsx(
              "w-spacing-12 h-spacing-12 border-3 rounded-full animate-spin mx-auto mb-spacing-4",
              inverted ? "border-grey-700 border-t-white" : "border-grey-300 border-t-black"
            )} />
            <p className={clsx("font-code text-mono-md", mutedTextClass)}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("min-h-screen", bgClass, className)}>
      {header}
      
      <div className="p-spacing-8 max-w-content mx-auto">
        {/* Page Header */}
        <div className="mb-spacing-8">
          <div className="flex items-center justify-between mb-spacing-2">
            <h1 className="font-display text-h1-sm tracking-tight">{title}</h1>
            <div className="flex gap-gap-sm">
              {onImport && (
                <button onClick={onImport} className={clsx("px-spacing-4 py-spacing-2 font-code text-mono-sm cursor-pointer", secondaryBtnClass)}>
                  ⬆️ Import
                </button>
              )}
              {onExport && (
                <button onClick={onExport} className={clsx("px-spacing-4 py-spacing-2 font-code text-mono-sm cursor-pointer", secondaryBtnClass)}>
                  ⬇️ Export
                </button>
              )}
              {onCreate && (
                <button onClick={onCreate} className={clsx("px-spacing-6 py-spacing-3 font-heading text-body-md tracking-wider uppercase cursor-pointer", primaryBtnClass)}>
                  + {createLabel}
                </button>
              )}
            </div>
          </div>
          {subtitle && (
            <p className={clsx("font-body text-body-md", mutedTextClass)}>{subtitle}</p>
          )}
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div className={clsx("grid gap-gap-md mb-spacing-8", stats.length <= 2 ? "grid-cols-2" : stats.length === 3 ? "grid-cols-3" : "grid-cols-4")}>
            {stats.map((stat, idx) => (
              <div key={idx} className={clsx("p-spacing-6 border", inverted ? "border-grey-800 bg-black" : "border-grey-200 bg-white")}>
                <div className="font-display text-h2-sm">{stat.value}</div>
                <div className={clsx("font-code text-mono-sm uppercase tracking-widest", inverted ? "text-grey-500" : "text-grey-400")}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex gap-gap-sm mb-spacing-4 flex-wrap">
          <div className="flex-1 min-w-card-sm relative">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchPlaceholder}
              className={clsx(
                "w-full py-spacing-3 px-spacing-4 pl-spacing-10 font-body text-body-md border outline-none",
                inverted
                  ? "bg-black text-white border-grey-700 focus:border-grey-500"
                  : "bg-white text-black border-grey-300 focus:border-grey-500"
              )}
            />
            <span className={clsx("absolute left-spacing-3 top-1/2 -translate-y-1/2", inverted ? "text-grey-500" : "text-grey-400")}>🔍</span>
          </div>
          {filters.map(filter => (
            <select
              key={filter.key}
              value={String(activeFilters[filter.key] || "All")}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className={clsx(
                "px-spacing-4 py-spacing-3 font-body text-body-md border",
                inverted ? "bg-black text-white border-grey-700" : "bg-white text-black border-grey-300"
              )}
            >
              <option value="All">{filter.label}: All</option>
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ))}
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className={clsx("px-spacing-4 py-spacing-3 font-code text-mono-sm bg-transparent border-none cursor-pointer underline", mutedTextClass)}>
              Clear ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Bulk Action Bar */}
        {selectedKeys.length > 0 && bulkActions.length > 0 && (
          <div className={clsx(
            "flex items-center justify-between px-spacing-4 py-spacing-3 mb-spacing-4",
            inverted ? "bg-white text-black" : "bg-black text-white"
          )}>
            <span className="font-code text-mono-md">
              <strong>{selectedKeys.length}</strong> selected
              <button onClick={() => setSelectedKeys([])} className={clsx("ml-spacing-4 bg-transparent border-none cursor-pointer underline", inverted ? "text-grey-600" : "text-grey-400")}>Clear</button>
            </span>
            <div className="flex gap-gap-xs">
              {bulkActions.map(action => (
                <button
                  key={action.id}
                  onClick={() => onBulkAction?.(action.id, selectedKeys)}
                  className={clsx(
                    "px-spacing-3 py-spacing-2 font-code text-mono-sm border-none cursor-pointer",
                    action.variant === "danger"
                      ? inverted ? "bg-grey-100 text-grey-700" : "bg-grey-800 text-grey-300"
                      : inverted ? "bg-grey-800 text-white" : "bg-grey-200 text-black"
                  )}
                >
                  {action.icon} {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results count */}
        <div className={clsx("mb-spacing-4 font-code text-mono-sm", inverted ? "text-grey-500" : "text-grey-400")}>
          {filteredData.length} {filteredData.length === 1 ? "result" : "results"}
        </div>

        {/* Table */}
        {filteredData.length === 0 ? (
          <div className={clsx("text-center px-spacing-8 py-spacing-16 border", inverted ? "border-grey-800" : "border-grey-200")}>
            <h3 className={clsx("font-heading text-h4-md mb-spacing-2", inverted ? "text-grey-500" : "text-grey-400")}>{emptyMessage}</h3>
            {emptyAction && (
              <button onClick={emptyAction.onClick} className={clsx("mt-spacing-4 px-spacing-6 py-spacing-3 font-heading text-body-md tracking-wider uppercase cursor-pointer", primaryBtnClass)}>
                {emptyAction.label}
              </button>
            )}
          </div>
        ) : (
          <div className={clsx("border overflow-auto", inverted ? "border-grey-800" : "border-grey-200")}>
            <table className="w-full border-collapse font-body text-body-md">
              <thead>
                <tr className={inverted ? "bg-grey-900" : "bg-grey-100"}>
                  {bulkActions.length > 0 && (
                    <th className="px-spacing-4 py-spacing-3 w-spacing-12 text-center">
                      <input type="checkbox" checked={selectedKeys.length === filteredData.length && filteredData.length > 0} onChange={handleSelectAll} className="cursor-pointer" />
                    </th>
                  )}
                  {columns.map(col => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable && handleSort(col.key)}
                      className={clsx(
                        "px-spacing-4 py-spacing-3 text-left font-code text-mono-sm font-weight-normal tracking-widest uppercase",
                        inverted ? "text-grey-400" : "text-grey-500",
                        col.sortable && "cursor-pointer"
                      )}
                      style={{ width: col.width }}
                    >
                      <span className="flex items-center gap-gap-xs">
                        {col.label}
                        {col.sortable && (
                          <span className={clsx("text-micro", sortColumn === col.key ? "opacity-100" : "opacity-30")}>
                            {sortColumn === col.key && sortDirection === "asc" ? "▲" : sortColumn === col.key && sortDirection === "desc" ? "▼" : "▲▼"}
                          </span>
                        )}
                      </span>
                    </th>
                  ))}
                  {rowActions.length > 0 && <th className="px-spacing-4 py-spacing-3 w-spacing-16" />}
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
                        "border-b transition-colors duration-fast",
                        inverted ? "border-grey-800" : "border-grey-200",
                        isSelected
                          ? inverted ? "bg-grey-900" : "bg-grey-100"
                          : "bg-transparent",
                        onRowClick && (inverted ? "cursor-pointer hover:bg-grey-900" : "cursor-pointer hover:bg-grey-100")
                      )}
                    >
                      {bulkActions.length > 0 && (
                        <td className="px-spacing-4 py-spacing-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={isSelected} onChange={() => handleSelectRow(key)} className="cursor-pointer" />
                        </td>
                      )}
                      {columns.map(col => {
                        const value = typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor];
                        const rendered = col.render ? col.render(value, row) : value;
                        return (
                          <td key={col.key} className={clsx("px-spacing-4 py-spacing-3", inverted ? "text-grey-300" : "text-grey-700")}>
                            {rendered as React.ReactNode}
                          </td>
                        );
                      })}
                      {rowActions.length > 0 && (
                        <td className="px-spacing-4 py-spacing-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <RowActionsMenu row={row} actions={rowActions} inverted={inverted} />
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
function RowActionsMenu<T>({ row, actions, inverted = true }: { row: T; actions: ListPageAction<T>[]; inverted?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          "p-spacing-1 bg-transparent border-none cursor-pointer text-body-md",
          inverted ? "text-grey-400 hover:text-grey-300" : "text-grey-500 hover:text-grey-700"
        )}
      >
        ⋮
      </button>
      {open && (
        <div className={clsx(
          "absolute top-full right-0 min-w-container-xs border z-dropdown",
          inverted ? "bg-grey-900 border-grey-700" : "bg-white border-grey-300"
        )}>
          {actions.map(action => (
            <button
              key={action.id}
              onClick={() => { setOpen(false); action.onClick(row); }}
              className={clsx(
                "block w-full px-spacing-3 py-spacing-2 text-left font-body text-body-sm bg-transparent border-none border-b cursor-pointer",
                inverted
                  ? "border-grey-800 hover:bg-grey-800"
                  : "border-grey-200 hover:bg-grey-100",
                action.variant === "danger"
                  ? inverted ? "text-grey-400" : "text-grey-500"
                  : inverted ? "text-grey-300" : "text-grey-700"
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
