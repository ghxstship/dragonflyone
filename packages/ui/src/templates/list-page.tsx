"use client";

import React, { useState, useCallback } from "react";
import { colors, typography, fontSizes, letterSpacing, transitions, borderWidths } from "../tokens.js";

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
      <div className={className} style={{ minHeight: "100vh", backgroundColor: colors.black, color: colors.white }}>
        {header}
        <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <h2 style={{ fontFamily: typography.heading, fontSize: fontSizes.h3MD, marginBottom: "1rem" }}>
            Error Loading Data
          </h2>
          <p style={{ fontFamily: typography.body, color: colors.grey400, marginBottom: "2rem" }}>
            {error.message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                padding: "0.75rem 1.5rem",
                fontFamily: typography.heading,
                fontSize: fontSizes.bodyMD,
                letterSpacing: letterSpacing.wider,
                textTransform: "uppercase",
                backgroundColor: colors.white,
                color: colors.black,
                border: `${borderWidths.medium} solid ${colors.white}`,
                cursor: "pointer",
              }}
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
      <div className={className} style={{ minHeight: "100vh", backgroundColor: colors.black, color: colors.white }}>
        {header}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "48px",
              height: "48px",
              border: `3px solid ${colors.grey700}`,
              borderTopColor: colors.white,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }} />
            <p style={{ fontFamily: typography.mono, fontSize: fontSizes.monoMD, color: colors.grey400 }}>
              Loading...
            </p>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className={className} style={{ minHeight: "100vh", backgroundColor: colors.black, color: colors.white }}>
      {header}
      
      <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Page Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <h1 style={{ fontFamily: typography.display, fontSize: fontSizes.h1SM, letterSpacing: letterSpacing.tight, margin: 0 }}>
              {title}
            </h1>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {onImport && (
                <button onClick={onImport} style={{ padding: "0.5rem 1rem", fontFamily: typography.mono, fontSize: fontSizes.monoSM, backgroundColor: "transparent", color: colors.grey400, border: `1px solid ${colors.grey700}`, cursor: "pointer" }}>
                  ⬆️ Import
                </button>
              )}
              {onExport && (
                <button onClick={onExport} style={{ padding: "0.5rem 1rem", fontFamily: typography.mono, fontSize: fontSizes.monoSM, backgroundColor: "transparent", color: colors.grey400, border: `1px solid ${colors.grey700}`, cursor: "pointer" }}>
                  ⬇️ Export
                </button>
              )}
              {onCreate && (
                <button onClick={onCreate} style={{ padding: "0.75rem 1.5rem", fontFamily: typography.heading, fontSize: fontSizes.bodyMD, letterSpacing: letterSpacing.wider, textTransform: "uppercase", backgroundColor: colors.white, color: colors.black, border: `${borderWidths.medium} solid ${colors.white}`, cursor: "pointer" }}>
                  + {createLabel}
                </button>
              )}
            </div>
          </div>
          {subtitle && (
            <p style={{ fontFamily: typography.body, fontSize: fontSizes.bodyMD, color: colors.grey400, margin: 0 }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`, gap: "1rem", marginBottom: "2rem" }}>
            {stats.map((stat, idx) => (
              <div key={idx} style={{ padding: "1.5rem", border: `1px solid ${colors.grey800}`, backgroundColor: colors.black }}>
                <div style={{ fontFamily: typography.display, fontSize: fontSizes.h2SM, color: colors.white }}>{stat.value}</div>
                <div style={{ fontFamily: typography.mono, fontSize: fontSizes.monoSM, color: colors.grey500, textTransform: "uppercase", letterSpacing: letterSpacing.widest }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Search and Filters */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 300px", position: "relative" }}>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchPlaceholder}
              style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", fontFamily: typography.body, fontSize: fontSizes.bodyMD, backgroundColor: colors.black, color: colors.white, border: `1px solid ${colors.grey700}`, outline: "none" }}
            />
            <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: colors.grey500 }}>🔍</span>
          </div>
          {filters.map(filter => (
            <select
              key={filter.key}
              value={String(activeFilters[filter.key] || "All")}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              style={{ padding: "0.75rem 1rem", fontFamily: typography.body, fontSize: fontSizes.bodyMD, backgroundColor: colors.black, color: colors.white, border: `1px solid ${colors.grey700}` }}
            >
              <option value="All">{filter.label}: All</option>
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ))}
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} style={{ padding: "0.75rem 1rem", fontFamily: typography.mono, fontSize: fontSizes.monoSM, backgroundColor: "transparent", color: colors.grey400, border: "none", cursor: "pointer", textDecoration: "underline" }}>
              Clear ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Bulk Action Bar */}
        {selectedKeys.length > 0 && bulkActions.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", backgroundColor: colors.white, color: colors.black, marginBottom: "1rem" }}>
            <span style={{ fontFamily: typography.mono, fontSize: fontSizes.monoMD }}>
              <strong>{selectedKeys.length}</strong> selected
              <button onClick={() => setSelectedKeys([])} style={{ marginLeft: "1rem", backgroundColor: "transparent", border: "none", color: colors.grey600, cursor: "pointer", textDecoration: "underline" }}>Clear</button>
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {bulkActions.map(action => (
                <button
                  key={action.id}
                  onClick={() => onBulkAction?.(action.id, selectedKeys)}
                  style={{ padding: "0.5rem 0.75rem", fontFamily: typography.mono, fontSize: fontSizes.monoSM, backgroundColor: action.variant === "danger" ? colors.grey100 : colors.grey800, color: action.variant === "danger" ? colors.grey700 : colors.white, border: "none", cursor: "pointer" }}
                >
                  {action.icon} {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results count */}
        <div style={{ marginBottom: "1rem", fontFamily: typography.mono, fontSize: fontSizes.monoSM, color: colors.grey500 }}>
          {filteredData.length} {filteredData.length === 1 ? "result" : "results"}
        </div>

        {/* Table */}
        {filteredData.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", border: `1px solid ${colors.grey800}` }}>
            <h3 style={{ fontFamily: typography.heading, fontSize: fontSizes.h4MD, color: colors.grey500, marginBottom: "0.5rem" }}>{emptyMessage}</h3>
            {emptyAction && (
              <button onClick={emptyAction.onClick} style={{ marginTop: "1rem", padding: "0.75rem 1.5rem", fontFamily: typography.heading, fontSize: fontSizes.bodyMD, letterSpacing: letterSpacing.wider, textTransform: "uppercase", backgroundColor: colors.white, color: colors.black, border: `${borderWidths.medium} solid ${colors.white}`, cursor: "pointer" }}>
                {emptyAction.label}
              </button>
            )}
          </div>
        ) : (
          <div style={{ border: `1px solid ${colors.grey800}`, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: typography.body, fontSize: fontSizes.bodyMD }}>
              <thead>
                <tr style={{ backgroundColor: colors.grey900 }}>
                  {bulkActions.length > 0 && (
                    <th style={{ padding: "0.875rem 1rem", width: "48px", textAlign: "center" }}>
                      <input type="checkbox" checked={selectedKeys.length === filteredData.length && filteredData.length > 0} onChange={handleSelectAll} style={{ cursor: "pointer" }} />
                    </th>
                  )}
                  {columns.map(col => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable && handleSort(col.key)}
                      style={{ padding: "0.875rem 1rem", textAlign: "left", fontFamily: typography.mono, fontSize: fontSizes.monoSM, fontWeight: 400, letterSpacing: letterSpacing.widest, textTransform: "uppercase", color: colors.grey400, cursor: col.sortable ? "pointer" : "default", width: col.width }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {col.label}
                        {col.sortable && (
                          <span style={{ fontSize: "8px", opacity: sortColumn === col.key ? 1 : 0.3 }}>
                            {sortColumn === col.key && sortDirection === "asc" ? "▲" : sortColumn === col.key && sortDirection === "desc" ? "▼" : "▲▼"}
                          </span>
                        )}
                      </span>
                    </th>
                  ))}
                  {rowActions.length > 0 && <th style={{ padding: "0.875rem 1rem", width: "60px" }} />}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, idx) => {
                  const key = getRowKey(row);
                  const isSelected = selectedKeys.includes(key);
                  return (
                    <tr
                      key={key}
                      onClick={() => onRowClick?.(row)}
                      style={{ borderBottom: `1px solid ${colors.grey800}`, backgroundColor: isSelected ? colors.grey900 : "transparent", cursor: onRowClick ? "pointer" : "default", transition: transitions.fast }}
                    >
                      {bulkActions.length > 0 && (
                        <td style={{ padding: "0.75rem 1rem", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={isSelected} onChange={() => handleSelectRow(key)} style={{ cursor: "pointer" }} />
                        </td>
                      )}
                      {columns.map(col => {
                        const value = typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor];
                        const rendered = col.render ? col.render(value, row) : value;
                        return (
                          <td key={col.key} style={{ padding: "0.75rem 1rem", color: colors.grey300 }}>
                            {rendered as React.ReactNode}
                          </td>
                        );
                      })}
                      {rowActions.length > 0 && (
                        <td style={{ padding: "0.75rem 1rem", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
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
    <div style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => setOpen(!open)} style={{ padding: "0.25rem", backgroundColor: "transparent", border: "none", cursor: "pointer", color: colors.grey400, fontSize: "16px" }}>⋮</button>
      {open && (
        <div style={{ position: "absolute", top: "100%", right: 0, minWidth: "140px", backgroundColor: colors.grey900, border: `1px solid ${colors.grey700}`, zIndex: 100 }}>
          {actions.map(action => (
            <button
              key={action.id}
              onClick={() => { setOpen(false); action.onClick(row); }}
              style={{ display: "block", width: "100%", padding: "0.5rem 0.75rem", textAlign: "left", fontFamily: typography.body, fontSize: fontSizes.bodySM, backgroundColor: "transparent", color: action.variant === "danger" ? colors.grey400 : colors.grey300, border: "none", borderBottom: `1px solid ${colors.grey800}`, cursor: "pointer" }}
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
