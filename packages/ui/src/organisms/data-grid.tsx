"use client";

import React, { useState, useMemo, useCallback } from "react";
import { colors, typography, fontSizes, letterSpacing, transitions, borderWidths } from "../tokens.js";

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

  const getCellValue = (row: T, column: DataGridColumn<T>): unknown => {
    if (typeof column.accessor === "function") return column.accessor(row);
    return row[column.accessor];
  };

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
  }, [data, sortColumn, sortDirection, columns]);

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

  const cellPadding = compact ? "0.5rem 0.75rem" : "0.75rem 1rem";
  const headerPadding = compact ? "0.625rem 0.75rem" : "0.875rem 1rem";
  const activeFilterCount = Object.values(activeFilters).reduce((count, value) => {
    if (Array.isArray(value)) return count + value.length;
    return count + (value ? 1 : 0);
  }, 0);

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Toolbar */}
      {(searchable || filters.length > 0 || columnVisibility) && (
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          {searchable && (
            <div style={{ flex: "1 1 300px", position: "relative" }}>
              <input
                type="text"
                value={localSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                style={{
                  width: "100%",
                  padding: cellPadding,
                  paddingLeft: "2.5rem",
                  fontFamily: typography.body,
                  fontSize: compact ? fontSizes.bodySM : fontSizes.bodyMD,
                  backgroundColor: colors.white,
                  border: `${borderWidths.medium} solid ${colors.black}`,
                  outline: "none",
                }}
              />
              <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: colors.grey500 }}>🔍</span>
            </div>
          )}

          {filters.map((group) => (
            <div key={group.key} style={{ position: "relative" }}>
              <button
                onClick={() => setExpandedFilter(expandedFilter === group.key ? null : group.key)}
                style={{
                  padding: cellPadding,
                  fontFamily: typography.mono,
                  fontSize: fontSizes.monoSM,
                  letterSpacing: letterSpacing.wide,
                  textTransform: "uppercase",
                  backgroundColor: activeFilters[group.key] ? colors.black : colors.white,
                  color: activeFilters[group.key] ? colors.white : colors.black,
                  border: `${borderWidths.medium} solid ${colors.black}`,
                  cursor: "pointer",
                }}
              >
                {group.label} {expandedFilter === group.key ? "▲" : "▼"}
              </button>
              {expandedFilter === group.key && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, marginTop: "4px",
                  minWidth: "200px", maxHeight: "300px", overflowY: "auto",
                  backgroundColor: colors.white, border: `${borderWidths.medium} solid ${colors.black}`, zIndex: 100,
                }}>
                  {group.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onFilterChange?.(group.key, option.value)}
                      style={{
                        display: "block", width: "100%", padding: "0.75rem 1rem",
                        fontFamily: typography.body, fontSize: fontSizes.bodySM,
                        backgroundColor: activeFilters[group.key] === option.value ? colors.grey100 : colors.white,
                        border: "none", borderBottom: `1px solid ${colors.grey200}`,
                        cursor: "pointer", textAlign: "left",
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {activeFilterCount > 0 && (
            <button onClick={onClearFilters} style={{
              padding: "0.25rem 0.5rem", fontFamily: typography.mono, fontSize: fontSizes.monoXS,
              backgroundColor: "transparent", color: colors.grey600, border: "none",
              cursor: "pointer", textDecoration: "underline",
            }}>
              CLEAR ALL ({activeFilterCount})
            </button>
          )}
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectable && selectedKeys.length > 0 && bulkActions.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0.75rem 1rem", backgroundColor: colors.black, color: colors.white,
        }}>
          <span style={{ fontFamily: typography.mono, fontSize: fontSizes.monoMD }}>
            <strong>{selectedKeys.length}</strong> selected
            <button onClick={() => onSelectionChange?.([])} style={{
              marginLeft: "1rem", padding: "0.25rem 0.5rem", backgroundColor: "transparent",
              color: colors.grey400, border: "none", cursor: "pointer", textDecoration: "underline",
            }}>Clear</button>
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {bulkActions.map((action) => (
              <button
                key={action.id}
                onClick={() => onBulkAction?.(action.id, selectedKeys)}
                disabled={action.disabled}
                style={{
                  padding: "0.5rem 0.75rem", fontFamily: typography.mono, fontSize: fontSizes.monoSM,
                  backgroundColor: action.variant === "danger" ? colors.white : colors.grey800,
                  color: action.variant === "danger" ? colors.black : colors.white,
                  border: `1px solid ${colors.grey600}`, cursor: action.disabled ? "not-allowed" : "pointer",
                  opacity: action.disabled ? 0.5 : 1,
                }}
              >
                {action.icon} {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ border: `${borderWidths.medium} solid ${colors.black}`, backgroundColor: colors.white, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: typography.body, fontSize: compact ? fontSizes.bodySM : fontSizes.bodyMD }}>
          <thead>
            <tr style={{ backgroundColor: colors.black, color: colors.white }}>
              {selectable && (
                <th style={{ padding: headerPadding, width: "48px", textAlign: "center" }}>
                  <input type="checkbox" checked={selectedKeys.length === data.length && data.length > 0} onChange={handleSelectAll} style={{ cursor: "pointer" }} />
                </th>
              )}
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => sortable && handleSort(column.key)}
                  style={{
                    padding: headerPadding, textAlign: column.align || "left",
                    fontFamily: typography.mono, fontSize: fontSizes.monoSM, fontWeight: 400,
                    letterSpacing: letterSpacing.widest, textTransform: "uppercase",
                    width: column.width, minWidth: column.minWidth,
                    cursor: column.sortable ? "pointer" : "default", userSelect: "none",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {column.label}
                    {column.sortable && (
                      <span style={{ display: "flex", flexDirection: "column", fontSize: "8px", lineHeight: 1 }}>
                        <span style={{ opacity: sortColumn === column.key && sortDirection === "asc" ? 1 : 0.3 }}>▲</span>
                        <span style={{ opacity: sortColumn === column.key && sortDirection === "desc" ? 1 : 0.3 }}>▼</span>
                      </span>
                    )}
                  </span>
                </th>
              ))}
              {rowActions.length > 0 && <th style={{ padding: headerPadding, width: "60px" }} />}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={visibleColumns.length + (selectable ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)} style={{ padding: "3rem", textAlign: "center" }}>
                  <div style={{ display: "inline-block", width: "24px", height: "24px", border: `2px solid ${colors.grey300}`, borderTopColor: colors.black, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + (selectable ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)} style={{ padding: "3rem", textAlign: "center", fontFamily: typography.mono, color: colors.grey500 }}>
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
                    style={{
                      backgroundColor: isSelected ? colors.grey100 : striped && index % 2 === 1 ? colors.grey100 : colors.white,
                      cursor: onRowClick ? "pointer" : "default",
                      borderBottom: `1px solid ${colors.grey200}`,
                    }}
                  >
                    {selectable && (
                      <td style={{ padding: cellPadding, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={isSelected} onChange={() => handleSelectRow(key)} style={{ cursor: "pointer" }} />
                      </td>
                    )}
                    {visibleColumns.map((column) => {
                      const value = getCellValue(row, column);
                      const rendered = column.render ? column.render(value, row) : value;
                      return (
                        <td key={column.key} style={{ padding: cellPadding, textAlign: column.align || "left", color: colors.grey800 }}>
                          {rendered as React.ReactNode}
                        </td>
                      );
                    })}
                    {rowActions.length > 0 && (
                      <td style={{ padding: cellPadding, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <span style={{ fontFamily: typography.mono, fontSize: fontSizes.monoSM, color: colors.grey600 }}>
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => onPageChange?.(pagination.page - 1)} disabled={pagination.page === 1} style={{ padding: "0.5rem 1rem", border: `${borderWidths.medium} solid ${colors.black}`, backgroundColor: colors.white, cursor: pagination.page === 1 ? "not-allowed" : "pointer", opacity: pagination.page === 1 ? 0.5 : 1 }}>
              Previous
            </button>
            <button onClick={() => onPageChange?.(pagination.page + 1)} disabled={pagination.page * pagination.pageSize >= pagination.total} style={{ padding: "0.5rem 1rem", border: `${borderWidths.medium} solid ${colors.black}`, backgroundColor: colors.white, cursor: pagination.page * pagination.pageSize >= pagination.total ? "not-allowed" : "pointer", opacity: pagination.page * pagination.pageSize >= pagination.total ? 0.5 : 1 }}>
              Next
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Inline row actions dropdown
function RowActionsDropdown<T>({ row, actions, onAction }: { row: T; actions: RowAction<T>[]; onAction?: (id: string, row: T) => void }) {
  const [open, setOpen] = useState(false);
  const visibleActions = actions.filter(a => typeof a.hidden === "function" ? !a.hidden(row) : !a.hidden);
  if (visibleActions.length === 0) return null;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => setOpen(!open)} style={{ padding: "0.25rem", backgroundColor: "transparent", border: "none", cursor: "pointer", fontSize: "16px" }}>⋮</button>
      {open && (
        <div style={{ position: "absolute", top: "100%", right: 0, minWidth: "140px", backgroundColor: colors.white, border: `${borderWidths.medium} solid ${colors.black}`, zIndex: 100 }}>
          {visibleActions.map((action) => {
            const disabled = typeof action.disabled === "function" ? action.disabled(row) : action.disabled;
            return (
              <button
                key={action.id}
                onClick={() => { setOpen(false); onAction?.(action.id, row); }}
                disabled={disabled}
                style={{ display: "block", width: "100%", padding: "0.5rem 0.75rem", textAlign: "left", backgroundColor: colors.white, border: "none", borderBottom: `1px solid ${colors.grey200}`, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }}
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
