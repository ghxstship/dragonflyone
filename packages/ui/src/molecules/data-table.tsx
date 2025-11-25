"use client";

import React, { useState, useMemo } from "react";
import { colors, typography, fontSizes, letterSpacing, transitions, borderWidths } from "../tokens.js";

export interface Column<T> {
  /** Unique key for the column */
  key: string;
  /** Column header label */
  label: string;
  /** Accessor function or key path */
  accessor: keyof T | ((row: T) => React.ReactNode);
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Column width */
  width?: string;
  /** Minimum column width */
  minWidth?: string;
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Custom cell renderer */
  render?: (value: unknown, row: T) => React.ReactNode;
  /** Whether column is hidden by default */
  hidden?: boolean;
  /** Whether column can be hidden */
  hideable?: boolean;
}

export interface DataTableProps<T> {
  /** Table data */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Row key accessor */
  rowKey: keyof T | ((row: T) => string);
  /** Enable row selection */
  selectable?: boolean;
  /** Selected row keys */
  selectedKeys?: string[];
  /** Selection change handler */
  onSelectionChange?: (keys: string[]) => void;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Empty state message */
  emptyMessage?: string;
  /** Loading state */
  loading?: boolean;
  /** Striped rows */
  striped?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Enable column visibility toggle */
  columnVisibility?: boolean;
  /** Hidden column keys */
  hiddenColumns?: string[];
  /** Column visibility change handler */
  onColumnVisibilityChange?: (hiddenKeys: string[]) => void;
  /** Sort change handler for controlled sorting */
  onSortChange?: (column: string, direction: "asc" | "desc" | null) => void;
  /** Custom className */
  className?: string;
}

type SortDirection = "asc" | "desc" | null;

export function DataTable<T>({
  data,
  columns,
  rowKey,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  onRowClick,
  emptyMessage = "No data available",
  loading = false,
  striped = false,
  compact = false,
  className = "",
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const getRowKey = (row: T): string => {
    if (typeof rowKey === "function") {
      return rowKey(row);
    }
    return String(row[rowKey]);
  };

  const getCellValue = (row: T, column: Column<T>): unknown => {
    if (typeof column.accessor === "function") {
      return column.accessor(row);
    }
    return row[column.accessor];
  };

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    const column = columns.find((c) => c.key === sortColumn);
    if (!column) return data;

    return [...data].sort((a, b) => {
      // Inline getCellValue to avoid dependency warning
      const aVal = typeof column.accessor === "function" 
        ? column.accessor(a) 
        : a[column.accessor];
      const bVal = typeof column.accessor === "function" 
        ? column.accessor(b) 
        : b[column.accessor];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection, columns]);

  const handleSort = (columnKey: string) => {
    const column = columns.find((c) => c.key === columnKey);
    if (!column?.sortable) return;

    if (sortColumn === columnKey) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
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
      onSelectionChange(selectedKeys.filter((k) => k !== key));
    } else {
      onSelectionChange([...selectedKeys, key]);
    }
  };

  const cellPadding = compact ? "0.5rem 0.75rem" : "0.75rem 1rem";
  const headerPadding = compact ? "0.625rem 0.75rem" : "0.875rem 1rem";

  return (
    <div
      className={className}
      style={{
        border: `${borderWidths.medium} solid ${colors.black}`,
        backgroundColor: colors.white,
        overflow: "auto",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: typography.body,
          fontSize: compact ? fontSizes.bodySM : fontSizes.bodyMD,
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: colors.black,
              color: colors.white,
            }}
          >
            {selectable && (
              <th
                style={{
                  padding: headerPadding,
                  width: "48px",
                  textAlign: "center",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedKeys.length === data.length && data.length > 0}
                  onChange={handleSelectAll}
                  style={{
                    width: "16px",
                    height: "16px",
                    cursor: "pointer",
                  }}
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => handleSort(column.key)}
                style={{
                  padding: headerPadding,
                  textAlign: column.align || "left",
                  fontFamily: typography.mono,
                  fontSize: fontSizes.monoSM,
                  fontWeight: 400,
                  letterSpacing: letterSpacing.widest,
                  textTransform: "uppercase",
                  width: column.width,
                  cursor: column.sortable ? "pointer" : "default",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {column.label}
                  {column.sortable && (
                    <span
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        fontSize: "8px",
                        lineHeight: 1,
                      }}
                    >
                      <span
                        style={{
                          opacity: sortColumn === column.key && sortDirection === "asc" ? 1 : 0.3,
                        }}
                      >
                        ▲
                      </span>
                      <span
                        style={{
                          opacity: sortColumn === column.key && sortDirection === "desc" ? 1 : 0.3,
                        }}
                      >
                        ▼
                      </span>
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                style={{
                  padding: "3rem",
                  textAlign: "center",
                  color: colors.grey500,
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    width: "24px",
                    height: "24px",
                    border: `2px solid ${colors.grey300}`,
                    borderTopColor: colors.black,
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <style>
                  {`@keyframes spin { to { transform: rotate(360deg); } }`}
                </style>
              </td>
            </tr>
          ) : sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                style={{
                  padding: "3rem",
                  textAlign: "center",
                  fontFamily: typography.mono,
                  fontSize: fontSizes.monoMD,
                  color: colors.grey500,
                  letterSpacing: letterSpacing.wide,
                }}
              >
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
                    backgroundColor: isSelected
                      ? colors.grey100
                      : striped && index % 2 === 1
                      ? colors.grey100
                      : colors.white,
                    cursor: onRowClick ? "pointer" : "default",
                    transition: transitions.fast,
                    borderBottom: `1px solid ${colors.grey200}`,
                  }}
                  onMouseEnter={(e) => {
                    if (onRowClick) {
                      e.currentTarget.style.backgroundColor = colors.grey100;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (onRowClick) {
                      e.currentTarget.style.backgroundColor = isSelected
                        ? colors.grey100
                        : striped && index % 2 === 1
                        ? colors.grey100
                        : colors.white;
                    }
                  }}
                >
                  {selectable && (
                    <td
                      style={{
                        padding: cellPadding,
                        textAlign: "center",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(key)}
                        style={{
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                        }}
                      />
                    </td>
                  )}
                  {columns.map((column) => {
                    const value = getCellValue(row, column);
                    const rendered = column.render ? column.render(value, row) : value;

                    return (
                      <td
                        key={column.key}
                        style={{
                          padding: cellPadding,
                          textAlign: column.align || "left",
                          color: colors.grey800,
                        }}
                      >
                        {rendered as React.ReactNode}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
