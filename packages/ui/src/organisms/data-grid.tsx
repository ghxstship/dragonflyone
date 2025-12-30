"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import clsx from "clsx";
import { Search, ChevronUp, ChevronDown, MoreVertical, Check, X } from "lucide-react";

export interface DataGridColumn<T> {
  key: string;
  label: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  /** Optional computed value that overrides accessor for rendering and sorting */
  formula?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  minWidth?: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T) => React.ReactNode;
  hidden?: boolean;
  editable?: boolean;
  editorType?: "text" | "number" | "select" | "date" | "checkbox" | "linked-record";
  editorOptions?: { value: string; label: string }[];
  validate?: (value: unknown, row: T) => string | null;
  linkedOptions?: { value: string; label: string; subtitle?: string }[];
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
  // Grouping
  groupBy?: (row: T) => string | null;
  groupLabel?: (groupKey: string | null) => React.ReactNode;
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
  columnVisibility = false,
  loading = false,
  emptyMessage = "No data available",
  striped = false,
  compact = false,
  className = "",
  inlineEditing = false,
  onCellEdit,
  groupBy,
  groupLabel,
  defaultCollapsedGroups = [],
  conditionalFormatting = [],
  onEditSnapshot,
}: DataGridProps<T>) {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(
    () => new Set(columns.filter((c) => c.hidden).map((c) => c.key))
  );
  const [sortColumn, setSortColumn] = useState<string | null>(defaultSort?.column ?? null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSort?.direction ?? null);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ rowKey: string; columnKey: string } | null>(null);
  const [editValue, setEditValue] = useState<unknown>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set(defaultCollapsedGroups));
  const editSnapshotRef = useRef<typeof onEditSnapshot>(onEditSnapshot);

  // Sync external searchValue changes
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  // Sync snapshot ref
  useEffect(() => {
    editSnapshotRef.current = onEditSnapshot;
  }, [onEditSnapshot]);

  const getRowKey = useCallback(
    (row: T): string => (typeof rowKey === "function" ? rowKey(row) : String(row[rowKey])),
    [rowKey]
  );

  const getCellValue = useCallback(
    (row: T, column: DataGridColumn<T>): unknown => {
      if (column.formula) return column.formula(row);
      if (typeof column.accessor === "function") return column.accessor(row);
      return row[column.accessor];
    },
    []
  );

  const visibleColumns = useMemo(
    () => columns.filter((col) => !col.hidden && !hiddenColumns.has(col.key)),
    [columns, hiddenColumns]
  );

  // Apply search + filter before sort
  const filteredData = useMemo(() => {
    let rows = [...data];

    // search (simple string match across stringified cells)
    if (localSearch.trim()) {
      const term = localSearch.toLowerCase();
      rows = rows.filter((row) =>
        visibleColumns.some((col) => {
          const val = getCellValue(row, col);
          return String(val ?? "").toLowerCase().includes(term);
        })
      );
    }

    // filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (!value) return;
      rows = rows.filter((row) => {
        const column = columns.find((c) => c.key === key);
        if (!column) return true;
        const cell = getCellValue(row, column);
        if (Array.isArray(value)) {
          return value.some((v) => String(cell) === String(v));
        }
        return String(cell) === String(value);
      });
    });

    return rows;
  }, [data, localSearch, activeFilters, visibleColumns, getCellValue, columns]);

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;
    const column = columns.find((c) => c.key === sortColumn);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = getCellValue(a, column);
      const bVal = getCellValue(b, column);
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection, columns, getCellValue]);

  const groupedData = useMemo(() => {
    if (!groupBy) return [{ group: null as string | null, rows: sortedData }];
    const groups = new Map<string | null, T[]>();
    sortedData.forEach((row) => {
      const key = groupBy(row);
      const bucket = groups.get(key) || [];
      bucket.push(row);
      groups.set(key, bucket);
    });
    return Array.from(groups.entries()).map(([group, rows]) => ({ group, rows }));
  }, [sortedData, groupBy]);

  const activeFilterCount = useMemo(
    () =>
      Object.values(activeFilters).reduce((count, value) => {
        if (Array.isArray(value)) return count + value.length;
        return count + (value ? 1 : 0);
      }, 0),
    [activeFilters]
  );

  const toggleGroup = (groupKey: string | null) => {
    if (groupKey === null) return;
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

  const rowFormattingClass = (row: T, columnKey?: string) => {
    const rule = conditionalFormatting.find(
      (r) => (!r.columnKey || r.columnKey === columnKey) && r.predicate(row)
    );
    return rule?.className || "";
  };

  const handleSort = (columnKey: string) => {
    const column = columns.find((c) => c.key === columnKey);
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
    if (selectedKeys.length === filteredData.length) onSelectionChange([]);
    else onSelectionChange(filteredData.map(getRowKey));
  };

  const handleSelectRow = (key: string) => {
    if (!onSelectionChange) return;
    if (selectedKeys.includes(key)) onSelectionChange(selectedKeys.filter((k) => k !== key));
    else onSelectionChange([...selectedKeys, key]);
  };

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    onSearchChange?.(value);
  };

  const handleCellDoubleClick = useCallback(
    (row: T, column: DataGridColumn<T>) => {
      if (!inlineEditing || !column.editable || !onCellEdit) return;
      const key = getRowKey(row);
      const value = getCellValue(row, column);
      setEditingCell({ rowKey: key, columnKey: column.key });
      setEditValue(value);
      setEditError(null);
    },
    [inlineEditing, onCellEdit, getRowKey, getCellValue]
  );

  const handleEditSave = useCallback(
    async (row: T, column: DataGridColumn<T>) => {
      if (!editingCell || !onCellEdit) return;

      if (column.validate) {
        const error = column.validate(editValue, row);
        if (error) {
          setEditError(error);
          return;
        }
      }

      setEditLoading(true);
      try {
        const previous = getCellValue(row, column);
        await onCellEdit(row, column.key, editValue);
        editSnapshotRef.current?.({ row, columnKey: column.key, previous, next: editValue });
        setEditingCell(null);
        setEditValue(null);
        setEditError(null);
      } catch (err) {
        setEditError(err instanceof Error ? err.message : "Failed to save");
      } finally {
        setEditLoading(false);
      }
    },
    [editingCell, editValue, onCellEdit, getCellValue]
  );

  const handleEditCancel = useCallback(() => {
    setEditingCell(null);
    setEditValue(null);
    setEditError(null);
  }, []);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent, row: T, column: DataGridColumn<T>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleEditSave(row, column);
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleEditCancel();
      }
    },
    [handleEditSave, handleEditCancel]
  );

  const renderEditor = useCallback(
    (row: T, column: DataGridColumn<T>) => {
      const editorType = column.editorType || "text";
      const baseInputClass = clsx(
        "w-full bg-surface-primary border-2 border-primary-500 rounded-button outline-none",
        compact ? "px-spacing-2 py-spacing-1 text-body-sm" : "px-spacing-3 py-spacing-2 text-body-md"
      );

      switch (editorType) {
        case "select":
          return (
            <select
              value={String(editValue ?? "")}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => handleEditKeyDown(e, row, column)}
              className={baseInputClass}
              autoFocus
            >
              {column.editorOptions?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        case "linked-record":
          return (
            <select
              value={String(editValue ?? "")}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => handleEditKeyDown(e, row, column)}
              className={baseInputClass}
              autoFocus
            >
              {(column.linkedOptions || []).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                  {opt.subtitle ? ` — ${opt.subtitle}` : ""}
                </option>
              ))}
            </select>
          );
        case "number":
          return (
            <input
              type="number"
              value={String(editValue ?? "")}
              onChange={(e) => setEditValue(e.target.valueAsNumber || 0)}
              onKeyDown={(e) => handleEditKeyDown(e, row, column)}
              className={baseInputClass}
              autoFocus
            />
          );
        case "date":
          return (
            <input
              type="date"
              value={String(editValue ?? "")}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => handleEditKeyDown(e, row, column)}
              className={baseInputClass}
              autoFocus
            />
          );
        case "checkbox":
          return (
            <input
              type="checkbox"
              checked={Boolean(editValue)}
              onChange={(e) => setEditValue(e.target.checked)}
              onKeyDown={(e) => handleEditKeyDown(e, row, column)}
              className="cursor-pointer"
              autoFocus
            />
          );
        default:
          return (
            <input
              type="text"
              value={String(editValue ?? "")}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => handleEditKeyDown(e, row, column)}
              className={baseInputClass}
              autoFocus
            />
          );
      }
    },
    [editValue, compact, handleEditKeyDown]
  );

  return (
    <div className={clsx("flex flex-col gap-gap-md", className)}>
      {(searchable || filters.length > 0) && (
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
              <span className="absolute left-spacing-3 top-1/2 -translate-y-1/2 text-on-dark-disabled">
                <Search className="size-4" />
              </span>
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
                {group.label}{" "}
                {expandedFilter === group.key ? <ChevronUp className="size-3 inline" /> : <ChevronDown className="size-3 inline" />}
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
            <button onClick={onClearFilters} className="px-spacing-2 py-spacing-1 font-code text-mono-xs bg-transparent text-on-dark-disabled border-none cursor-pointer underline">
              CLEAR ALL ({activeFilterCount})
            </button>
          )}

          {columnVisibility && (
            <div className="relative">
              <button
                onClick={() => setColumnMenuOpen((o) => !o)}
                className={clsx(
                  "font-code text-mono-sm tracking-wide uppercase border-2 border-black cursor-pointer",
                  compact ? "px-spacing-3 py-spacing-2" : "px-spacing-4 py-spacing-3"
                )}
              >
                Columns {columnMenuOpen ? <ChevronUp className="size-3 inline" /> : <ChevronDown className="size-3 inline" />}
              </button>
              {columnMenuOpen && (
                <div className="absolute top-full left-0 mt-spacing-1 min-w-container-sm max-h-container-lg overflow-y-auto bg-surface-elevated border-2 border-border-primary z-dropdown">
                  {columns.map((col) => (
                    <label
                      key={col.key}
                      className="flex items-center gap-gap-xs px-spacing-4 py-spacing-2 cursor-pointer hover:bg-surface-secondary"
                    >
                      <input
                        type="checkbox"
                        checked={!hiddenColumns.has(col.key) && !col.hidden}
                        onChange={(e) => {
                          setHiddenColumns((prev) => {
                            const next = new Set(prev);
                            if (!e.target.checked) next.add(col.key);
                            else next.delete(col.key);
                            return next;
                          });
                        }}
                      />
                      <span className="font-body text-body-sm">{col.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {selectable && selectedKeys.length > 0 && bulkActions.length > 0 && (
        <div className="flex items-center justify-between px-spacing-4 py-spacing-3 bg-black text-white">
          <span className="font-code text-mono-md">
            <strong>{selectedKeys.length}</strong> selected
            <button onClick={() => onSelectionChange?.([])} className="ml-spacing-4 px-spacing-2 py-spacing-1 bg-transparent text-on-dark-muted border-none cursor-pointer underline">
              Clear
            </button>
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

      <div className="border-2 border-border-primary bg-surface-primary overflow-auto" role="region" aria-label="Data table">
        <table className={clsx("w-full border-collapse font-body", compact ? "text-body-sm" : "text-body-md")} role="grid" aria-rowcount={filteredData.length}>
          <thead>
            <tr className="bg-black text-white" role="row">
              {selectable && (
                <th className={clsx("w-12 text-center", compact ? "px-spacing-3 py-spacing-2" : "px-spacing-4 py-spacing-3")} scope="col">
                  <input 
                    type="checkbox" 
                    checked={selectedKeys.length === filteredData.length && filteredData.length > 0} 
                    onChange={handleSelectAll} 
                    className="cursor-pointer"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => sortable && column.sortable && handleSort(column.key)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && sortable && column.sortable) {
                      e.preventDefault();
                      handleSort(column.key);
                    }
                  }}
                  tabIndex={column.sortable ? 0 : undefined}
                  scope="col"
                  aria-sort={sortColumn === column.key ? (sortDirection === "asc" ? "ascending" : "descending") : undefined}
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
                      <span className="flex flex-col text-micro-xs leading-none" aria-hidden="true">
                        <ChevronUp className={clsx("size-2", sortColumn === column.key && sortDirection === "asc" ? "opacity-100" : "opacity-30")} />
                        <ChevronDown className={clsx("size-2", sortColumn === column.key && sortDirection === "desc" ? "opacity-100" : "opacity-30")} />
                      </span>
                    )}
                  </span>
                </th>
              ))}
              {rowActions.length > 0 && <th className={clsx("w-spacing-14", compact ? "px-spacing-3 py-spacing-2" : "px-spacing-4 py-spacing-3")} scope="col" aria-label="Actions" />}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr role="row">
                <td colSpan={visibleColumns.length + (selectable ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)} className="p-spacing-12 text-center">
                  <div 
                    className="inline-block w-spacing-6 h-spacing-6 border-2 border-grey-300 border-t-black rounded-full animate-spin" 
                    role="progressbar"
                    aria-label="Loading data"
                  />
                </td>
              </tr>
            ) : groupedData.length === 0 ? (
              <tr role="row">
                <td colSpan={visibleColumns.length + (selectable ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)} className="p-spacing-12 text-center font-code text-on-dark-disabled" role="cell">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              groupedData.map(({ group, rows }) => (
                <React.Fragment key={group ?? "default"}>
                  {groupBy && (
                    <tr className="bg-grey-900 text-white">
                      <td colSpan={visibleColumns.length + (selectable ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)} className="px-spacing-4 py-spacing-3">
                        <button
                          onClick={() => toggleGroup(group)}
                          className="flex items-center gap-gap-xs font-code text-mono-sm text-left bg-transparent border-none cursor-pointer text-white"
                        >
                          {collapsedGroups.has(group ?? "") ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
                          {groupLabel ? groupLabel(group) : group ?? "Ungrouped"}
                        </button>
                      </td>
                    </tr>
                  )}
                  {!collapsedGroups.has(group ?? "") &&
                    rows.map((row, index) => {
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
                            <td className={clsx("text-center", compact ? "px-spacing-3 py-spacing-2" : "px-spacing-4 py-spacing-3")} role="gridcell" onClick={(e) => e.stopPropagation()}>
                              <input 
                                type="checkbox" 
                                checked={isSelected} 
                                onChange={() => handleSelectRow(key)} 
                                className="cursor-pointer"
                                aria-label={`Select row ${index + 1}`}
                              />
                            </td>
                          )}
                          {visibleColumns.map((column) => {
                            const cellValue = getCellValue(row, column);
                            const isEditing = editingCell?.rowKey === key && editingCell?.columnKey === column.key;
                            const rendered = column.render ? column.render(cellValue, row) : cellValue;

                            return (
                              <td
                                key={column.key}
                                onDoubleClick={() => handleCellDoubleClick(row, column)}
                                className={clsx(
                                  "text-text-secondary",
                                  compact ? "px-spacing-3 py-spacing-2" : "px-spacing-4 py-spacing-3",
                                  column.align === "center" && "text-center",
                                  column.align === "right" && "text-right",
                                  !column.align && "text-left",
                                  column.editable && inlineEditing && "cursor-text hover:bg-surface-secondary",
                                  rowFormattingClass(row, column.key)
                                )}
                              >
                                {isEditing ? (
                                  <div className="flex items-center gap-gap-xs" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex-1">
                                      {renderEditor(row, column)}
                                      {editError && <p className="text-error-500 text-body-xs mt-spacing-1">{editError}</p>}
                                    </div>
                                    <button
                                      onClick={() => handleEditSave(row, column)}
                                      disabled={editLoading}
                                      className="p-spacing-1 text-success-500 hover:bg-success-500/10 rounded-button border-none bg-transparent cursor-pointer"
                                      title="Save (Enter)"
                                    >
                                      {editLoading ? (
                                        <span className="inline-block w-4 h-4 border-2 border-grey-300 border-t-success-500 rounded-avatar animate-spin" />
                                      ) : (
                                        <Check className="size-4" />
                                      )}
                                    </button>
                                    <button
                                      onClick={handleEditCancel}
                                      disabled={editLoading}
                                      className="p-spacing-1 text-error-500 hover:bg-error-500/10 rounded-button border-none bg-transparent cursor-pointer"
                                      title="Cancel (Escape)"
                                    >
                                      <X className="size-4" />
                                    </button>
                                  </div>
                                ) : (
                                  rendered as React.ReactNode
                                )}
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
                    })}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <nav className="flex items-center justify-between flex-wrap gap-gap-md" aria-label="Pagination">
          <span className="font-code text-mono-sm text-on-dark-disabled" aria-live="polite">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
          </span>
          <div className="flex gap-gap-xs" role="group" aria-label="Pagination controls">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
              aria-label="Go to previous page"
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
              aria-label="Go to next page"
              className={clsx(
                "px-spacing-4 py-spacing-2 border-2 border-border-primary bg-surface-primary text-text-primary",
                pagination.page * pagination.pageSize >= pagination.total ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-grey-100"
              )}
            >
              Next
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

function RowActionsDropdown<T>({
  row,
  actions,
  onAction,
}: {
  row: T;
  actions: RowAction<T>[];
  onAction?: (id: string, row: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const visibleActions = actions.filter((a) => (typeof a.hidden === "function" ? !a.hidden(row) : !a.hidden));
  if (visibleActions.length === 0) return null;

  return (
    <div className="relative inline-block">
      <button 
        onClick={() => setOpen(!open)} 
        className="p-spacing-1 bg-transparent border-none cursor-pointer text-body-md hover:text-on-dark-disabled"
        aria-label="Row actions"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreVertical className="size-4" aria-hidden="true" />
      </button>
      {open && (
        <div 
          className="absolute top-full right-0 min-w-container-xs bg-surface-elevated border-2 border-border-primary z-dropdown"
          role="menu"
          aria-label="Row actions menu"
        >
          {visibleActions.map((action) => {
            const disabled = typeof action.disabled === "function" ? action.disabled(row) : action.disabled;
            return (
              <button
                key={action.id}
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onAction?.(action.id, row);
                }}
                disabled={disabled}
                className={clsx(
                  "block w-full px-spacing-3 py-spacing-2 text-left bg-surface-primary text-text-primary border-none border-b border-border-secondary hover:bg-surface-secondary",
                  disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                )}
              >
                <span aria-hidden="true">{action.icon}</span> {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DataGrid;
