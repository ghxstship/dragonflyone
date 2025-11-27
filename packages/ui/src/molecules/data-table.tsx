"use client";

import React, { useState, useMemo } from "react";
import clsx from "clsx";

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
  /** Inverted theme (dark background) */
  inverted?: boolean;
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
  inverted = false,
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

  return (
    <div
      className={clsx(
        "border-2 overflow-auto",
        inverted ? "border-grey-700 bg-ink-900" : "border-black bg-white",
        className
      )}
    >
      <table
        className={clsx(
          "w-full border-collapse font-body",
          compact ? "text-body-sm" : "text-body-md"
        )}
      >
        <thead>
          <tr className={inverted ? "bg-grey-800 text-grey-200" : "bg-black text-white"}>
            {selectable && (
              <th className={clsx("w-spacing-12 text-center", compact ? "px-spacing-3 py-spacing-2" : "px-spacing-4 py-spacing-3")}>
                <input
                  type="checkbox"
                  checked={selectedKeys.length === data.length && data.length > 0}
                  onChange={handleSelectAll}
                  className="w-spacing-4 h-spacing-4 cursor-pointer"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => handleSort(column.key)}
                className={clsx(
                  "font-code text-mono-sm font-weight-normal tracking-widest uppercase whitespace-nowrap select-none",
                  compact ? "px-spacing-3 py-spacing-2" : "px-spacing-4 py-spacing-3",
                  column.sortable ? "cursor-pointer" : "cursor-default",
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right",
                  !column.align && "text-left"
                )}
                style={{ width: column.width }}
              >
                <span className="flex items-center gap-gap-xs">
                  {column.label}
                  {column.sortable && (
                    <span className="flex flex-col text-micro-xs leading-none">
                      <span className={sortColumn === column.key && sortDirection === "asc" ? "opacity-100" : "opacity-30"}>
                        ▲
                      </span>
                      <span className={sortColumn === column.key && sortDirection === "desc" ? "opacity-100" : "opacity-30"}>
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
                className={clsx("p-spacing-12 text-center", inverted ? "text-grey-400" : "text-grey-500")}
              >
                <div className={clsx(
                  "inline-block w-spacing-6 h-spacing-6 border-2 rounded-full animate-spin",
                  inverted ? "border-grey-600 border-t-white" : "border-grey-300 border-t-black"
                )} />
              </td>
            </tr>
          ) : sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className={clsx(
                  "p-spacing-12 text-center font-code text-mono-md tracking-wide",
                  inverted ? "text-grey-400" : "text-grey-500"
                )}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, index) => {
              const key = getRowKey(row);
              const isSelected = selectedKeys.includes(key);

              const getRowBg = () => {
                if (inverted) {
                  if (isSelected) return "bg-grey-800";
                  if (striped && index % 2 === 1) return "bg-grey-900";
                  return "bg-ink-900";
                }
                if (isSelected) return "bg-grey-100";
                if (striped && index % 2 === 1) return "bg-grey-100";
                return "bg-white";
              };

              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(row)}
                  className={clsx(
                    "border-b transition-colors duration-fast",
                    inverted ? "border-grey-700" : "border-grey-200",
                    getRowBg(),
                    onRowClick && (inverted ? "cursor-pointer hover:bg-grey-800" : "cursor-pointer hover:bg-grey-100")
                  )}
                >
                  {selectable && (
                    <td
                      className={clsx("text-center", compact ? "px-spacing-3 py-spacing-2" : "px-spacing-4 py-spacing-3")}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(key)}
                        className="w-spacing-4 h-spacing-4 cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((column) => {
                    const value = getCellValue(row, column);
                    const rendered = column.render ? column.render(value, row) : value;

                    return (
                      <td
                        key={column.key}
                        className={clsx(
                          inverted ? "text-grey-200" : "text-grey-800",
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
