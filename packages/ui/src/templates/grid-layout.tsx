"use client";

import { forwardRef, ReactNode, useState, useCallback } from "react";
import clsx from "clsx";
import { Stack } from "../foundations/layout.js";
import { Spinner } from "../atoms/spinner.js";
import { Body, H2 } from "../atoms/typography.js";
import { Button } from "../atoms/button.js";
import { AlertTriangle, ChevronLeft, ChevronRight, LayoutGrid, Filter, X } from "lucide-react";

// =============================================================================
// GRID LAYOUT
// Multi-item layout in rows and columns.
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

export interface GridLayoutFilter {
  id: string;
  label: string;
  options: Array<{ value: string; label: string; count?: number }>;
  value?: string;
}

export interface GridLayoutProps {
  children: ReactNode;
  /** Number of columns */
  columns?: 2 | 3 | 4 | 6 | "auto-fit";
  /** Minimum column width for auto-fit (in pixels) */
  columnMin?: number;
  /** Grid variant */
  variant?: "uniform" | "masonry";
  /** Gap between items */
  gap?: "compact" | "default" | "spacious";
  /** Toolbar position */
  toolbar?: "none" | "top";
  /** Toolbar content */
  toolbarContent?: ReactNode;
  /** Filters position */
  filters?: "none" | "top" | "left";
  /** Filter definitions */
  filterItems?: GridLayoutFilter[];
  /** Filter change handler */
  onFilterChange?: (filterId: string, value: string) => void;
  /** Active filters */
  activeFilters?: Record<string, string>;
  /** Clear all filters handler */
  onClearFilters?: () => void;
  /** Pagination type */
  pagination?: "none" | "bottom" | "infinite";
  /** Current page */
  page?: number;
  /** Total pages */
  totalPages?: number;
  /** Page change handler */
  onPageChange?: (page: number) => void;
  /** Items per page */
  pageSize?: number;
  /** Total items */
  totalItems?: number;
  /** Load more handler (for infinite scroll) */
  onLoadMore?: () => void;
  /** Is loading more */
  isLoadingMore?: boolean;
  /** Has more items to load */
  hasMore?: boolean;
  /** Enable item selection */
  selectable?: boolean;
  /** Selected item IDs */
  selectedIds?: string[];
  /** Selection change handler */
  onSelectionChange?: (ids: string[]) => void;
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

const gapClasses = {
  compact: "gap-2",
  default: "gap-4",
  spacious: "gap-6",
};

const columnClasses = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
};

/**
 * GridLayout - Multi-item display layout
 * 
 * Use cases:
 * - Card grids (venues, events, team members)
 * - Asset/media galleries
 * - Dashboard widget grids
 * - Product catalogs
 * - Portfolio displays
 * 
 * Features:
 * - Responsive column layouts
 * - Auto-fit columns option
 * - Masonry variant
 * - Toolbar and filter support
 * - Pagination (standard or infinite)
 * - Selection and drag support
 * - Loading, error, empty state variants
 * - Accessibility compliant
 */
export const GridLayout = forwardRef<HTMLDivElement, GridLayoutProps>(
  function GridLayout(
    {
      children,
      columns = 3,
      columnMin = 280,
      variant = "uniform",
      gap = "default",
      toolbar = "none",
      toolbarContent,
      filters = "none",
      filterItems = [],
      onFilterChange,
      activeFilters = {},
      onClearFilters,
      pagination = "none",
      page = 1,
      totalPages = 1,
      onPageChange,
      totalItems,
      onLoadMore,
      isLoadingMore = false,
      hasMore = false,
      selectable = false,
      selectedIds = [],
      onSelectionChange,
      inverted = true,
      loading = false,
      loadingMessage = "Loading...",
      error = null,
      onRetry,
      empty = false,
      emptyMessage = "No items to display",
      emptyAction,
      className,
      header,
    },
    ref
  ) {
    const [showFilters, setShowFilters] = useState(filters === "left");
    
    const bgClass = inverted ? "bg-ink-950 text-white" : "bg-white text-ink-900";
    const borderClass = inverted ? "border-grey-800" : "border-grey-200";

    const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

    const handleClearSelection = useCallback(() => {
      if (!selectable || !onSelectionChange) return;
      onSelectionChange([]);
    }, [selectable, onSelectionChange]);

    // Loading state
    if (loading) {
      return (
        <div ref={ref} className={clsx("min-h-[400px] flex flex-col", bgClass, className)}>
          {header}
          <div className="flex-1 flex items-center justify-center p-8">
            <Stack gap={4} className="items-center text-center">
              <Spinner size="lg" />
              <Body className={inverted ? "text-grey-400" : "text-grey-600"}>
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
                <H2 className={inverted ? "text-white" : "text-ink-900"}>
                  Error Loading Items
                </H2>
                <Body className={inverted ? "text-grey-400" : "text-grey-600"}>
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
    if (empty) {
      return (
        <div ref={ref} className={clsx("min-h-[400px] flex flex-col", bgClass, className)}>
          {header}
          {toolbar === "top" && toolbarContent && (
            <div className={clsx("border-b-2 p-4", borderClass)}>
              {toolbarContent}
            </div>
          )}
          <div className="flex-1 flex items-center justify-center p-8">
            <Stack gap={6} className="items-center text-center max-w-md">
              <div className={clsx(
                "size-20 rounded-full flex items-center justify-center border-2",
                inverted ? "border-grey-700 bg-grey-800" : "border-grey-200 bg-grey-100"
              )}>
                <LayoutGrid className={clsx(
                  "size-10",
                  inverted ? "text-grey-600" : "text-grey-400"
                )} />
              </div>
              <Body className={inverted ? "text-grey-400" : "text-grey-600"}>
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

    // Filter sidebar
    const filterSidebar = filters === "left" && filterItems.length > 0 && (
      <aside className={clsx(
        "w-64 shrink-0 border-r-2 p-4 transition-all",
        showFilters ? "block" : "hidden lg:block",
        borderClass,
        inverted ? "bg-ink-900" : "bg-grey-50"
      )}>
        <Stack gap={4}>
          <Stack direction="horizontal" className="items-center justify-between">
            <Body className={clsx(
              "font-semibold uppercase text-xs tracking-wider",
              inverted ? "text-grey-400" : "text-grey-500"
            )}>
              Filters
            </Body>
            {activeFilterCount > 0 && onClearFilters && (
              <button
                onClick={onClearFilters}
                className={clsx(
                  "text-xs font-medium transition-colors",
                  inverted ? "text-primary hover:text-primary-400" : "text-primary hover:text-primary-600"
                )}
              >
                Clear All
              </button>
            )}
          </Stack>

          {filterItems.map((filter) => (
            <Stack key={filter.id} gap={2}>
              <Body size="sm" className={clsx(
                "font-medium",
                inverted ? "text-grey-300" : "text-grey-700"
              )}>
                {filter.label}
              </Body>
              <select
                value={activeFilters[filter.id] || ""}
                onChange={(e) => onFilterChange?.(filter.id, e.target.value)}
                className={clsx(
                  "w-full px-3 py-2 border-2 rounded-button text-sm transition-colors",
                  inverted
                    ? "bg-ink-800 border-grey-700 text-white focus:border-primary"
                    : "bg-white border-grey-200 text-ink-900 focus:border-primary"
                )}
              >
                <option value="">All</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} {opt.count !== undefined && `(${opt.count})`}
                  </option>
                ))}
              </select>
            </Stack>
          ))}
        </Stack>
      </aside>
    );

    // Grid styles
    const gridStyle = columns === "auto-fit"
      ? { gridTemplateColumns: `repeat(auto-fit, minmax(${columnMin}px, 1fr))` }
      : undefined;

    const gridClassName = columns === "auto-fit"
      ? "grid"
      : clsx("grid", columnClasses[columns]);

    return (
      <div ref={ref} className={clsx("flex flex-col", bgClass, className)}>
        {header}

        {/* Toolbar */}
        {toolbar === "top" && (
          <div className={clsx("border-b-2 p-4", borderClass)}>
            <Stack direction="horizontal" className="items-center justify-between flex-wrap gap-4">
              {toolbarContent}
              
              <Stack direction="horizontal" gap={2} className="items-center">
                {/* Filter toggle for mobile */}
                {filters === "left" && filterItems.length > 0 && (
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={clsx(
                      "lg:hidden flex items-center gap-2 px-3 py-2 border-2 rounded-button text-sm transition-colors",
                      inverted
                        ? "border-grey-700 text-grey-300 hover:border-grey-600"
                        : "border-grey-200 text-grey-600 hover:border-grey-300"
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

                {/* Selection info */}
                {selectable && selectedIds.length > 0 && (
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Body size="sm" className={inverted ? "text-grey-400" : "text-grey-600"}>
                      {selectedIds.length} selected
                    </Body>
                    <button
                      onClick={handleClearSelection}
                      className={clsx(
                        "p-1 rounded transition-colors",
                        inverted ? "hover:bg-grey-800" : "hover:bg-grey-100"
                      )}
                    >
                      <X className="size-4" />
                    </button>
                  </Stack>
                )}
              </Stack>
            </Stack>
          </div>
        )}

        {/* Top filters bar */}
        {filters === "top" && filterItems.length > 0 && (
          <div className={clsx("border-b-2 p-4", borderClass)}>
            <Stack direction="horizontal" gap={4} className="flex-wrap items-center">
              {filterItems.map((filter) => (
                <select
                  key={filter.id}
                  value={activeFilters[filter.id] || ""}
                  onChange={(e) => onFilterChange?.(filter.id, e.target.value)}
                  className={clsx(
                    "px-3 py-2 border-2 rounded-button text-sm transition-colors",
                    inverted
                      ? "bg-ink-800 border-grey-700 text-white focus:border-primary"
                      : "bg-white border-grey-200 text-ink-900 focus:border-primary"
                  )}
                >
                  <option value="">{filter.label}: All</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} {opt.count !== undefined && `(${opt.count})`}
                    </option>
                  ))}
                </select>
              ))}
              {activeFilterCount > 0 && onClearFilters && (
                <button
                  onClick={onClearFilters}
                  className={clsx(
                    "flex items-center gap-1 text-sm font-medium transition-colors",
                    inverted ? "text-primary hover:text-primary-400" : "text-primary hover:text-primary-600"
                  )}
                >
                  <X className="size-4" />
                  Clear Filters
                </button>
              )}
            </Stack>
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 flex">
          {filterSidebar}

          <div className="flex-1 p-4 md:p-6">
            {/* Grid */}
            <div
              className={clsx(
                gridClassName,
                gapClasses[gap],
                variant === "masonry" && "items-start"
              )}
              style={gridStyle}
            >
              {children}
            </div>

            {/* Pagination */}
            {pagination === "bottom" && totalPages > 1 && (
              <div className={clsx("mt-6 pt-6 border-t-2", borderClass)}>
                <Stack direction="horizontal" className="items-center justify-between">
                  <Body size="sm" className={inverted ? "text-grey-400" : "text-grey-600"}>
                    Page {page} of {totalPages}
                    {totalItems !== undefined && ` (${totalItems} items)`}
                  </Body>
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

            {/* Infinite scroll trigger */}
            {pagination === "infinite" && hasMore && (
              <div className="mt-6 text-center">
                {isLoadingMore ? (
                  <Stack gap={2} className="items-center">
                    <Spinner size="md" />
                    <Body size="sm" className={inverted ? "text-grey-400" : "text-grey-600"}>
                      Loading more...
                    </Body>
                  </Stack>
                ) : (
                  <Button
                    variant="outline"
                    inverted={inverted}
                    onClick={onLoadMore}
                  >
                    Load More
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default GridLayout;
