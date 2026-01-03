"use client";

import { forwardRef, ReactNode, useState } from "react";
import clsx from "clsx";
import { Stack } from "../foundations/layout.js";
import { Spinner } from "../atoms/spinner.js";
import { Body, H2 } from "../atoms/typography.js";
import { Button } from "../atoms/button.js";
import { 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  Search,
  Filter,
  X,
  Table as TableIcon,
  Download,
  Settings2
} from "lucide-react";

// =============================================================================
// TABLE LAYOUT
// Tabular data display with controls.
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

export interface TableColumn<T> {
  id: string;
  label: string;
  accessor: keyof T | ((row: T) => ReactNode);
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  minWidth?: string;
  align?: "left" | "center" | "right";
  sticky?: boolean;
  hidden?: boolean;
  render?: (value: unknown, row: T, index: number) => ReactNode;
}

export interface TableFilter {
  id: string;
  label: string;
  type: "text" | "select" | "date" | "number";
  options?: Array<{ value: string; label: string }>;
  value?: string;
}

export interface TableLayoutProps<T> {
  /** Table data */
  data: T[];
  /** Column definitions */
  columns: TableColumn<T>[];
  /** Row key accessor */
  rowKey: keyof T | ((row: T) => string);
  /** Toolbar configuration */
  toolbar?: "none" | "basic" | "full";
  /** Toolbar content (custom) */
  toolbarContent?: ReactNode;
  /** Row density */
  density?: "compact" | "default" | "spacious";
  /** Table variant */
  variant?: "striped" | "bordered" | "borderless";
  /** Sticky header */
  stickyHeader?: boolean;
  /** Sticky first column */
  stickyColumn?: boolean;
  /** Enable column resizing */
  resizable?: boolean;
  /** Enable sorting */
  sortable?: boolean;
  /** Current sort column */
  sortColumn?: string;
  /** Sort direction */
  sortDirection?: "asc" | "desc";
  /** Sort change handler */
  onSortChange?: (column: string, direction: "asc" | "desc") => void;
  /** Enable filtering */
  filterable?: boolean;
  /** Filter definitions */
  filters?: TableFilter[];
  /** Active filters */
  activeFilters?: Record<string, string>;
  /** Filter change handler */
  onFilterChange?: (filterId: string, value: string) => void;
  /** Clear filters handler */
  onClearFilters?: () => void;
  /** Enable row selection */
  selectable?: "none" | "single" | "multi";
  /** Selected row keys */
  selectedKeys?: string[];
  /** Selection change handler */
  onSelectionChange?: (keys: string[]) => void;
  /** Enable row expansion */
  expandable?: boolean;
  /** Expanded row keys */
  expandedKeys?: string[];
  /** Expansion change handler */
  onExpansionChange?: (keys: string[]) => void;
  /** Row expansion content renderer */
  expandedRowRender?: (row: T) => ReactNode;
  /** Enable inline editing */
  editable?: boolean;
  /** Cell edit handler */
  onCellEdit?: (rowKey: string, columnId: string, value: unknown) => void;
  /** Detail panel position */
  detailPanel?: "none" | "right" | "bottom" | "modal";
  /** Detail panel content renderer */
  detailPanelRender?: (row: T) => ReactNode;
  /** Selected row for detail panel */
  selectedRow?: T | null;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Pagination type */
  pagination?: "none" | "bottom" | "infinite";
  /** Current page */
  page?: number;
  /** Total pages */
  totalPages?: number;
  /** Page change handler */
  onPageChange?: (page: number) => void;
  /** Page size */
  pageSize?: number;
  /** Page size options */
  pageSizeOptions?: number[];
  /** Page size change handler */
  onPageSizeChange?: (size: number) => void;
  /** Total items */
  totalItems?: number;
  /** Enable virtualization for large datasets */
  virtualized?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Search value */
  searchValue?: string;
  /** Search change handler */
  onSearchChange?: (value: string) => void;
  /** Export handler */
  onExport?: () => void;
  /** Column visibility toggle */
  columnVisibility?: boolean;
  /** Visible columns */
  visibleColumns?: string[];
  /** Visibility change handler */
  onVisibilityChange?: (columns: string[]) => void;
  /** Dark/light theme */
  inverted?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Error state */
  error?: Error | null;
  /** Error retry handler */
  onRetry?: () => void;
  /** Empty state */
  empty?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state action */
  emptyAction?: { label: string; onClick: () => void };
  /** Custom className */
  className?: string;
  /** Header content */
  header?: ReactNode;
}

const densityClasses = {
  compact: "py-2 px-3 text-sm",
  default: "py-3 px-4",
  spacious: "py-4 px-5",
};

const headerDensityClasses = {
  compact: "py-2 px-3 text-xs",
  default: "py-3 px-4 text-sm",
  spacious: "py-4 px-5 text-sm",
};

/**
 * TableLayout - Tabular data display layout
 * 
 * Use cases:
 * - User management
 * - Data administration
 * - Inventory lists
 * - Transaction logs
 * - Report tables
 * - Spreadsheet-style editing
 * 
 * Features:
 * - Sortable columns
 * - Filterable data
 * - Row selection (single/multi)
 * - Row expansion
 * - Sticky header/column
 * - Pagination
 * - Search
 * - Export
 * - Column visibility toggle
 * - Loading, error, empty state variants
 * - Accessibility compliant
 */
export const TableLayout = forwardRef(function TableLayout<T>(
  {
    data,
    columns,
    rowKey,
    toolbar = "none",
    toolbarContent,
    density = "default",
    variant = "borderless",
    stickyHeader = false,
    stickyColumn = false,
    sortable = false,
    sortColumn,
    sortDirection,
    onSortChange,
    filterable = false,
    filters = [],
    activeFilters = {},
    onFilterChange,
    onClearFilters,
    selectable = "none",
    selectedKeys = [],
    onSelectionChange,
    expandable = false,
    expandedKeys = [],
    onExpansionChange,
    expandedRowRender,
    onRowClick,
    pagination = "none",
    page = 1,
    totalPages = 1,
    onPageChange,
    pageSize = 10,
    pageSizeOptions = [10, 25, 50, 100],
    onPageSizeChange,
    totalItems,
    searchPlaceholder = "Search...",
    searchValue = "",
    onSearchChange,
    onExport,
    columnVisibility = false,
    visibleColumns,
    onVisibilityChange,
    inverted = true,
    loading = false,
    loadingMessage = "Loading...",
    error = null,
    onRetry,
    empty = false,
    emptyMessage = "No data to display",
    emptyAction,
    className,
    header,
  }: TableLayoutProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  const bgClass = inverted ? "bg-surface-inverse text-text-primary" : "bg-surface-primary text-text-primary";
  const borderClass = inverted ? "border-border" : "border-border";
  const headerBgClass = inverted ? "bg-surface-elevated" : "bg-muted";

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  const getRowKey = (row: T): string => {
    if (typeof rowKey === "function") return rowKey(row);
    return String(row[rowKey]);
  };

  const getCellValue = (row: T, column: TableColumn<T>): unknown => {
    if (typeof column.accessor === "function") return column.accessor(row);
    return row[column.accessor];
  };

  const handleSort = (columnId: string) => {
    if (!sortable || !onSortChange) return;
    const newDirection = sortColumn === columnId && sortDirection === "asc" ? "desc" : "asc";
    onSortChange(columnId, newDirection);
  };

  const handleSelectAll = () => {
    if (selectable !== "multi" || !onSelectionChange) return;
    if (selectedKeys.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(getRowKey));
    }
  };

  const handleSelectRow = (key: string) => {
    if (!onSelectionChange) return;
    if (selectable === "single") {
      onSelectionChange(selectedKeys.includes(key) ? [] : [key]);
    } else if (selectable === "multi") {
      onSelectionChange(
        selectedKeys.includes(key)
          ? selectedKeys.filter((k) => k !== key)
          : [...selectedKeys, key]
      );
    }
  };

  const handleExpandRow = (key: string) => {
    if (!expandable || !onExpansionChange) return;
    onExpansionChange(
      expandedKeys.includes(key)
        ? expandedKeys.filter((k) => k !== key)
        : [...expandedKeys, key]
    );
  };

  const displayColumns = visibleColumns
    ? columns.filter((col) => visibleColumns.includes(col.id) || col.sticky)
    : columns.filter((col) => !col.hidden);

  // Loading state
  if (loading) {
    return (
      <div ref={ref} className={clsx("min-h-[400px] flex flex-col", bgClass, className)}>
        {header}
        <div className="flex-1 flex items-center justify-center p-8">
          <Stack gap={4} className="items-center text-center">
            <Spinner size="lg" />
            <Body className={inverted ? "text-text-muted" : "text-text-muted"}>
              {loadingMessage}
            </Body>
          </Stack>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div ref={ref} className={clsx("min-h-[400px] flex flex-col", bgClass, className)}>
        {header}
        <div className="flex-1 flex items-center justify-center p-8">
          <Stack gap={6} className="items-center text-center max-w-md">
            <AlertTriangle className="size-16 text-error animate-shake" />
            <Stack gap={2} className="items-center">
              <H2 className={inverted ? "text-text-primary" : "text-text-primary"}>
                Error Loading Data
              </H2>
              <Body className={inverted ? "text-text-muted" : "text-text-muted"}>
                {error.message || "An unexpected error occurred"}
              </Body>
            </Stack>
            {onRetry && (
              <Button variant="solid" onClick={onRetry}>
                Try Again
              </Button>
            )}
          </Stack>
        </div>
      </div>
    );
  }

  // Empty state
  if (empty || data.length === 0) {
    return (
      <div ref={ref} className={clsx("min-h-[400px] flex flex-col", bgClass, className)}>
        {header}
        {toolbar !== "none" && (
          <div className={clsx("border-b-2 p-4", borderClass)}>
            {toolbarContent}
          </div>
        )}
        <div className="flex-1 flex items-center justify-center p-8">
          <Stack gap={6} className="items-center text-center max-w-md">
            <div className={clsx(
              "size-20 rounded-full flex items-center justify-center border-2",
              inverted ? "border-border bg-surface-elevated" : "border-border bg-muted"
            )}>
              <TableIcon className={clsx(
                "size-10",
                inverted ? "text-text-disabled" : "text-text-muted"
              )} />
            </div>
            <Body className={inverted ? "text-text-muted" : "text-text-muted"}>
              {emptyMessage}
            </Body>
            {emptyAction && (
              <Button variant="solid" onClick={emptyAction.onClick}>
                {emptyAction.label}
              </Button>
            )}
          </Stack>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={clsx("flex flex-col", bgClass, className)}>
      {header}

      {/* Toolbar */}
      {toolbar !== "none" && (
        <div className={clsx("border-b-2 p-4", borderClass)}>
          <Stack direction="horizontal" className="items-center justify-between flex-wrap gap-4">
            {/* Left side: Search + Filters */}
            <Stack direction="horizontal" gap={3} className="items-center flex-wrap">
              {onSearchChange && (
                <div className={clsx(
                  "flex items-center gap-2 px-3 py-2 border-2 rounded-button",
                  inverted
                    ? "bg-surface-elevated border-border focus-within:border-primary"
                    : "bg-surface-primary border-border focus-within:border-primary"
                )}>
                  <Search className={clsx("size-4", inverted ? "text-text-disabled" : "text-text-muted")} />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={searchPlaceholder}
                    className={clsx(
                      "bg-transparent outline-none text-sm w-48",
                      inverted ? "text-text-primary placeholder:text-text-disabled" : "text-text-primary placeholder:text-text-muted"
                    )}
                  />
                  {searchValue && (
                    <button onClick={() => onSearchChange("")} className="p-0.5">
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              )}

              {filterable && filters.length > 0 && (
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-2 border-2 rounded-button text-sm transition-colors",
                    showFilters
                      ? "border-primary bg-primary/10 text-primary"
                      : inverted
                        ? "border-border text-text-secondary hover:border-border-primary"
                        : "border-border text-text-disabled hover:border-border-primary"
                  )}
                >
                  <Filter className="size-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="px-1.5 py-0.5 text-xs font-bold bg-primary text-white rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              )}

              {toolbarContent}
            </Stack>

            {/* Right side: Actions */}
            <Stack direction="horizontal" gap={2} className="items-center">
              {toolbar === "full" && (
                <>
                  {onExport && (
                    <Button variant="ghost" size="sm" inverted={inverted} onClick={onExport}>
                      <Download className="size-4 mr-2" />
                      Export
                    </Button>
                  )}

                  {columnVisibility && (
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        inverted={inverted}
                        onClick={() => setShowColumnSettings(!showColumnSettings)}
                      >
                        <Settings2 className="size-4" />
                      </Button>
                      {showColumnSettings && (
                        <div className={clsx(
                          "absolute right-0 top-full mt-2 w-48 border-2 rounded-card p-2 z-dropdown",
                          inverted ? "bg-surface-elevated border-border" : "bg-surface-primary border-border"
                        )}>
                          <Body size="sm" className={clsx("px-2 py-1 font-semibold", inverted ? "text-text-muted" : "text-text-muted")}>
                            Columns
                          </Body>
                          {columns.map((col) => (
                            <label
                              key={col.id}
                              className={clsx(
                                "flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer",
                                inverted ? "hover:bg-surface-elevated" : "hover:bg-muted"
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={!visibleColumns || visibleColumns.includes(col.id)}
                                onChange={(e) => {
                                  if (!onVisibilityChange) return;
                                  const current = visibleColumns || columns.map((c) => c.id);
                                  onVisibilityChange(
                                    e.target.checked
                                      ? [...current, col.id]
                                      : current.filter((id) => id !== col.id)
                                  );
                                }}
                                className="rounded"
                              />
                              <span className="text-sm">{col.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {selectable !== "none" && selectedKeys.length > 0 && (
                <Body size="sm" className={inverted ? "text-text-muted" : "text-text-muted"}>
                  {selectedKeys.length} selected
                </Body>
              )}
            </Stack>
          </Stack>

          {/* Filter bar */}
          {showFilters && filters.length > 0 && (
            <Stack direction="horizontal" gap={3} className="mt-4 flex-wrap items-center">
              {filters.map((filter) => (
                <div key={filter.id}>
                  {filter.type === "select" ? (
                    <select
                      value={activeFilters[filter.id] || ""}
                      onChange={(e) => onFilterChange?.(filter.id, e.target.value)}
                      className={clsx(
                        "px-3 py-2 border-2 rounded-button text-sm",
                        inverted
                          ? "bg-surface-elevated border-border text-text-primary"
                          : "bg-surface-primary border-border text-text-primary"
                      )}
                    >
                      <option value="">{filter.label}: All</option>
                      {filter.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={filter.type}
                      value={activeFilters[filter.id] || ""}
                      onChange={(e) => onFilterChange?.(filter.id, e.target.value)}
                      placeholder={filter.label}
                      className={clsx(
                        "px-3 py-2 border-2 rounded-button text-sm",
                        inverted
                          ? "bg-surface-elevated border-border text-text-primary placeholder:text-text-disabled"
                          : "bg-surface-primary border-border text-text-primary placeholder:text-text-muted"
                      )}
                    />
                  )}
                </div>
              ))}
              {activeFilterCount > 0 && onClearFilters && (
                <button
                  onClick={onClearFilters}
                  className={clsx(
                    "flex items-center gap-1 text-sm font-medium",
                    inverted ? "text-primary hover:text-primary-400" : "text-primary hover:text-primary-600"
                  )}
                >
                  <X className="size-4" />
                  Clear
                </button>
              )}
            </Stack>
          )}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className={clsx(
            stickyHeader && "sticky top-0 z-sticky-header",
            headerBgClass
          )}>
            <tr className={clsx("border-b-2", borderClass)}>
              {/* Selection checkbox column */}
              {selectable !== "none" && (
                <th className={clsx(headerDensityClasses[density], "w-12")}>
                  {selectable === "multi" && (
                    <input
                      type="checkbox"
                      checked={selectedKeys.length === data.length && data.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  )}
                </th>
              )}

              {/* Expansion column */}
              {expandable && (
                <th className={clsx(headerDensityClasses[density], "w-12")} />
              )}

              {/* Data columns */}
              {displayColumns.map((column) => (
                <th
                  key={column.id}
                  className={clsx(
                    headerDensityClasses[density],
                    "font-semibold uppercase tracking-wider text-left",
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right",
                    column.sticky && stickyColumn && "sticky left-0 z-10",
                    column.sticky && stickyColumn && headerBgClass,
                    inverted ? "text-text-muted" : "text-text-muted"
                  )}
                  style={{ width: column.width, minWidth: column.minWidth }}
                >
                  {column.sortable && sortable ? (
                    <button
                      onClick={() => handleSort(column.id)}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      {column.label}
                      {sortColumn === column.id && (
                        sortDirection === "asc" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />
                      )}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => {
              const key = getRowKey(row);
              const isSelected = selectedKeys.includes(key);
              const isExpanded = expandedKeys.includes(key);

              return (
                <>
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(row)}
                    className={clsx(
                      "transition-colors",
                      variant === "striped" && rowIndex % 2 === 1 && (inverted ? "bg-surface-elevated/50" : "bg-muted"),
                      variant === "bordered" && clsx("border-b-2", borderClass),
                      isSelected && (inverted ? "bg-primary/10" : "bg-primary/5"),
                      onRowClick && "cursor-pointer",
                      inverted ? "hover:bg-surface-elevated" : "hover:bg-muted"
                    )}
                  >
                    {/* Selection checkbox */}
                    {selectable !== "none" && (
                      <td className={clsx(densityClasses[density], "w-12")}>
                        <input
                          type={selectable === "single" ? "radio" : "checkbox"}
                          checked={isSelected}
                          onChange={() => handleSelectRow(key)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded"
                        />
                      </td>
                    )}

                    {/* Expansion toggle */}
                    {expandable && (
                      <td className={clsx(densityClasses[density], "w-12")}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExpandRow(key);
                          }}
                          className={clsx(
                            "p-1 rounded transition-colors",
                            inverted ? "hover:bg-surface-elevated" : "hover:bg-muted"
                          )}
                        >
                          {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </button>
                      </td>
                    )}

                    {/* Data cells */}
                    {displayColumns.map((column) => {
                      const value = getCellValue(row, column);
                      return (
                        <td
                          key={column.id}
                          className={clsx(
                            densityClasses[density],
                            column.align === "center" && "text-center",
                            column.align === "right" && "text-right",
                            column.sticky && stickyColumn && "sticky left-0 z-10",
                            column.sticky && stickyColumn && (inverted ? "bg-surface-inverse" : "bg-surface-primary")
                          )}
                          style={{ width: column.width, minWidth: column.minWidth }}
                        >
                          {column.render ? column.render(value, row, rowIndex) : String(value ?? "")}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Expanded row content */}
                  {expandable && isExpanded && expandedRowRender && (
                    <tr key={`${key}-expanded`}>
                      <td
                        colSpan={displayColumns.length + (selectable !== "none" ? 1 : 0) + 1}
                        className={clsx(
                          "p-4",
                          inverted ? "bg-surface-elevated" : "bg-muted"
                        )}
                      >
                        {expandedRowRender(row)}
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination === "bottom" && (
        <div className={clsx("border-t-2 p-4", borderClass)}>
          <Stack direction="horizontal" className="items-center justify-between flex-wrap gap-4">
            <Stack direction="horizontal" gap={4} className="items-center">
              {onPageSizeChange && (
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Body size="sm" className={inverted ? "text-text-muted" : "text-text-muted"}>
                    Show
                  </Body>
                  <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className={clsx(
                      "px-2 py-1 border-2 rounded-button text-sm",
                      inverted
                        ? "bg-surface-elevated border-border text-text-primary"
                        : "bg-surface-primary border-border text-text-primary"
                    )}
                  >
                    {pageSizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </Stack>
              )}
              <Body size="sm" className={inverted ? "text-text-muted" : "text-text-muted"}>
                Page {page} of {totalPages}
                {totalItems !== undefined && ` (${totalItems} items)`}
              </Body>
            </Stack>

            <Stack direction="horizontal" gap={2}>
              <Button
                variant="outline"
                size="sm"
                inverted={inverted}
                onClick={() => onPageChange?.(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                inverted={inverted}
                onClick={() => onPageChange?.(page + 1)}
                disabled={page >= totalPages}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </Stack>
          </Stack>
        </div>
      )}
    </div>
  );
}) as <T>(props: TableLayoutProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }) => JSX.Element;

export default TableLayout;
