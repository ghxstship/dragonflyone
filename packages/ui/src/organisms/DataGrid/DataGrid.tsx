"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import clsx from "clsx";
import { Search, ChevronUp, ChevronDown, MoreVertical, Check, X } from "lucide-react";
import { Tooltip } from "../../atoms/Tooltip/index.js";
import { dataGridVariants } from "./DataGrid.variants.js";
import type { 
  DataGridProps, 
  DataGridColumn, 
  RowAction,
  StatusVariant 
} from "./DataGrid.types.js";

type SortDirection = "asc" | "desc" | null;

// =============================================================================
// SSOT CELL VALUE FORMATTING
// =============================================================================

const STATUS_VARIANT_STYLES: Record<StatusVariant, string> = {
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  error: 'bg-error/10 text-error border-error/20',
  info: 'bg-info/10 text-info border-info/20',
  ghost: 'bg-muted/50 text-muted-foreground border-muted',
  outline: 'bg-transparent text-foreground border-border',
};

function formatCellValue<T>(
  value: unknown, 
  column: DataGridColumn<T>
): React.ReactNode {
  if (value === null || value === undefined) return '—';
  
  const { dataType, formatOptions, statusColors } = column;
  
  switch (dataType) {
    case 'status':
    case 'badge': {
      const strValue = String(value);
      const variant = statusColors?.[strValue] || 'ghost';
      const styles = STATUS_VARIANT_STYLES[variant] || STATUS_VARIANT_STYLES.ghost;
      const displayValue = strValue.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      return React.createElement('span', {
        className: `inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-badge border ${styles}`,
      }, displayValue);
    }
    
    case 'currency': {
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      if (isNaN(num)) return '—';
      return new Intl.NumberFormat(formatOptions?.locale || 'en-US', {
        style: 'currency',
        currency: formatOptions?.currency || 'USD',
      }).format(num);
    }
    
    case 'date': {
      const date = new Date(String(value));
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleDateString(formatOptions?.locale || 'en-US');
    }
    
    case 'datetime': {
      const date = new Date(String(value));
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleString(formatOptions?.locale || 'en-US');
    }
    
    case 'number': {
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      if (isNaN(num)) return '—';
      return new Intl.NumberFormat(formatOptions?.locale || 'en-US', {
        maximumFractionDigits: formatOptions?.precision ?? 2,
      }).format(num);
    }
    
    case 'boolean':
      return value ? 'Yes' : 'No';
    
    default:
      return String(value);
  }
}

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
  density,
  className = "",
  inlineEditing = false,
  onCellEdit,
  groupBy,
  groupLabel,
  defaultCollapsedGroups = [],
  conditionalFormatting = [],
  onEditSnapshot,
}: DataGridProps<T>) {
  // Compute effective density - density prop takes precedence over compact
  const effectiveDensity = density || (compact ? "compact" : "default");
  const isCompact = effectiveDensity === "compact";
  const isRelaxed = effectiveDensity === "relaxed";
  
  // Density-based padding classes
  const cellPadding = isCompact 
    ? "px-spacing-2 py-spacing-1" 
    : isRelaxed 
      ? "px-spacing-5 py-spacing-4" 
      : "px-spacing-4 py-spacing-3";
  const cellTextSize = isCompact ? "text-body-sm" : "text-body-md";
  
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
      // Handle string accessor (for entity registry compatibility)
      const key = column.accessor as string;
      return (row as Record<string, unknown>)[key];
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
        cellPadding, cellTextSize
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
    [editValue, cellPadding, cellTextSize, handleEditKeyDown]
  );

  return (
    <div className={clsx(dataGridVariants({ density: effectiveDensity, striped, loading }), className)}>
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
                  cellPadding, cellTextSize
                )}
              />
              <span className="absolute left-spacing-3 top-1/2 -translate-y-1/2 text-text-disabled">
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
                  cellPadding,
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
                        "block w-full px-spacing-4 py-spacing-3 font-body text-body-sm border-none border-b border-border cursor-pointer text-left hover:bg-muted",
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
            <button onClick={onClearFilters} className="px-spacing-2 py-spacing-1 font-code text-mono-xs bg-transparent text-text-disabled border-none cursor-pointer underline">
              CLEAR ALL ({activeFilterCount})
            </button>
          )}

          {columnVisibility && (
            <div className="relative">
              <button
                onClick={() => setColumnMenuOpen((o) => !o)}
                className={clsx(
                  "font-code text-mono-sm tracking-wide uppercase border-2 border-black cursor-pointer",
                  cellPadding
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
            <button onClick={() => onSelectionChange?.([])} className="ml-spacing-4 px-spacing-2 py-spacing-1 bg-transparent text-text-muted border-none cursor-pointer underline">
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
                  "px-spacing-3 py-spacing-2 font-code text-mono-sm border border-border",
                  action.variant === "danger" ? "bg-white text-black" : "bg-surface-elevated text-white",
                  action.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                )}
              >
                {action.icon} {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Card View - visible on small screens */}
      <div className="block md:hidden space-y-3" role="list" aria-label="Data cards">
        {loading ? (
          <div className="p-8 text-center border-2 border-border rounded-[var(--radius-card)]">
            <div className="inline-block w-6 h-6 border-2 border-border border-t-black rounded-full animate-spin" role="progressbar" aria-label="Loading data" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-8 text-center font-code text-text-disabled border-2 border-border rounded-[var(--radius-card)]">
            {emptyMessage}
          </div>
        ) : (
          filteredData.map((row) => {
            const key = getRowKey(row);
            const isSelected = selectedKeys.includes(key);
            return (
              <div
                key={key}
                onClick={() => onRowClick?.(row)}
                className={clsx(
                  "border-2 border-border rounded-[var(--radius-card)] p-4 bg-surface-primary",
                  "transition-all duration-100",
                  onRowClick && "cursor-pointer hover:shadow-md hover:-translate-x-0.5 hover:-translate-y-0.5",
                  isSelected && "bg-surface-elevated border-primary-500"
                )}
                role="listitem"
              >
                {selectable && (
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectRow(key);
                      }}
                      className="cursor-pointer w-4 h-4"
                      aria-label={`Select row ${key}`}
                    />
                    <span className="font-code text-xs text-text-muted uppercase">Select</span>
                  </div>
                )}
                <div className="space-y-2">
                  {visibleColumns.slice(0, 6).map((column) => {
                    const value = getCellValue(row, column);
                    const rendered = column.render ? column.render(value, row) : formatCellValue(value, column);
                    return (
                      <div key={column.key} className="flex justify-between items-start gap-2">
                        <span className="font-code text-xs text-text-muted uppercase tracking-wide shrink-0">{column.label}</span>
                        <span className={clsx("text-sm text-right", column.align === "right" && "font-mono")}>{rendered}</span>
                      </div>
                    );
                  })}
                </div>
                {rowActions.length > 0 && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    {rowActions.filter(a => !(typeof a.hidden === 'function' ? a.hidden(row) : a.hidden)).slice(0, 3).map((action) => (
                      <button
                        key={action.id}
                        onClick={(e) => { e.stopPropagation(); onRowAction?.(action.id, row); }}
                        disabled={typeof action.disabled === 'function' ? action.disabled(row) : action.disabled}
                        className={clsx(
                          "flex-1 px-3 py-2 text-xs font-code uppercase border-2 rounded-[var(--radius-button)]",
                          action.variant === "danger" ? "border-error-500 text-error-500" : "border-border text-text-primary",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View - hidden on small screens */}
      <div className="hidden md:block border-2 border-border-primary bg-surface-primary overflow-auto" role="region" aria-label="Data table">
        <table className={clsx("w-full border-collapse font-body", cellTextSize)} role="grid" aria-rowcount={filteredData.length}>
          <thead>
            <tr className="bg-black text-white" role="row">
              {selectable && (
                <th className={clsx("w-12 text-center", cellPadding)} scope="col">
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
                    cellPadding,
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
              {rowActions.length > 0 && <th className={clsx("w-spacing-14", cellPadding)} scope="col" aria-label="Actions" />}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr role="row">
                <td colSpan={visibleColumns.length + (selectable ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)} className="p-spacing-12 text-center">
                  <div 
                    className="inline-block w-spacing-6 h-spacing-6 border-2 border-border border-t-black rounded-full animate-spin" 
                    role="progressbar"
                    aria-label="Loading data"
                  />
                </td>
              </tr>
            ) : groupedData.length === 0 ? (
              <tr role="row">
                <td colSpan={visibleColumns.length + (selectable ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)} className="p-spacing-12 text-center font-code text-text-disabled" role="cell">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              groupedData.map(({ group, rows }) => (
                <React.Fragment key={group ?? "default"}>
                  {groupBy && (
                    <tr className="bg-surface-elevated text-white">
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
                            "border-b border-border transition-colors duration-fast",
                            isSelected ? "bg-surface-secondary" : striped && index % 2 === 1 ? "bg-surface-secondary" : "bg-surface-primary",
                            onRowClick && "cursor-pointer hover:bg-muted"
                          )}
                        >
                          {selectable && (
                            <td className={clsx("text-center", cellPadding)} role="gridcell" onClick={(e) => e.stopPropagation()}>
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
                            const rendered = column.render 
                              ? column.render(cellValue, row) 
                              : formatCellValue(cellValue, column);

                            return (
                              <td
                                key={column.key}
                                onDoubleClick={() => handleCellDoubleClick(row, column)}
                                className={clsx(
                                  "text-text-secondary",
                                  cellPadding,
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
                                    <Tooltip content={<span>Save <kbd className="ml-1 px-1 py-0.5 bg-black/20 rounded text-xs">Enter</kbd></span>}>
                                      <button
                                        onClick={() => handleEditSave(row, column)}
                                        disabled={editLoading}
                                        className="p-spacing-1 text-success-500 hover:bg-success-500/10 rounded-button border-none bg-transparent cursor-pointer"
                                        aria-label="Save changes"
                                      >
                                        {editLoading ? (
                                          <span className="inline-block w-4 h-4 border-2 border-border border-t-success-500 rounded-avatar animate-spin" />
                                        ) : (
                                          <Check className="size-4" />
                                        )}
                                      </button>
                                    </Tooltip>
                                    <Tooltip content={<span>Cancel <kbd className="ml-1 px-1 py-0.5 bg-black/20 rounded text-xs">Esc</kbd></span>}>
                                      <button
                                        onClick={handleEditCancel}
                                        disabled={editLoading}
                                        className="p-spacing-1 text-error-500 hover:bg-error-500/10 rounded-button border-none bg-transparent cursor-pointer"
                                        aria-label="Cancel editing"
                                      >
                                        <X className="size-4" />
                                      </button>
                                    </Tooltip>
                                  </div>
                                ) : (
                                  rendered as React.ReactNode
                                )}
                              </td>
                            );
                          })}
                          {rowActions.length > 0 && (
                            <td className={clsx("text-center", cellPadding)} onClick={(e) => e.stopPropagation()}>
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
          <span className="font-code text-mono-sm text-text-disabled" aria-live="polite">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
          </span>
          <div className="flex gap-gap-xs" role="group" aria-label="Pagination controls">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
              aria-label="Go to previous page"
              className={clsx(
                "px-spacing-4 py-spacing-2 border-2 border-border-primary bg-surface-primary text-text-primary",
                pagination.page === 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-muted"
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
                pagination.page * pagination.pageSize >= pagination.total ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-muted"
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
        className="p-spacing-1 bg-transparent border-none cursor-pointer text-body-md hover:text-text-disabled"
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
