"use client";

import React, { useState } from "react";
import {
  Search,
  Upload,
  Download,
  RefreshCw,
  Filter,
  ChevronDown,
  X,
  List,
  LayoutGrid,
  Columns3,
  Calendar as CalendarIcon,
  GanttChart as GanttIcon,
  Table,
  Clock,
  MapPin,
  Image,
  MoreHorizontal,
} from "lucide-react";
import { 
  listPageToolbarVariants,
  listPageToolbarHeaderVariants,
  listPageToolbarTitleVariants,
  listPageToolbarActionsVariants,
  listPageToolbarSearchVariants,
  listPageToolbarControlsVariants,
  listPageToolbarButtonVariants 
} from "./ListPageToolbar.variants.js";
import type { ListPageToolbarProps, ViewIconType } from "./ListPageToolbar.types.js";

/**
 * ListPageToolbar component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Interactive elements
 * - Search functionality
 * - View switching
 * - Filter controls
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <ListPageToolbar
 *   title="Users"
 *   searchValue={searchValue}
 *   onSearchChange={setSearchValue}
 *   views={[
 *     { id: 'list', label: 'List', icon: 'list' },
 *     { id: 'grid', label: 'Grid', icon: 'grid' }
 *   ]}
 *   activeView="list"
 *   onViewChange={setActiveView}
 * />
 * ```
 */
export function ListPageToolbar({
  title,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  activeFilters,
  onFilterChange,
  activeFilterCount,
  onClearFilters,
  views,
  activeView,
  onViewChange,
  onDensityChange,
  onRefresh,
  isRefreshing = false,
  onImport,
  onExport,
  onCreate,
  createLabel = "Create",
  quickActions,
  savedFiltersSlot,
  inverted = false,
  className,
}: ListPageToolbarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showDensity, setShowDensity] = useState(false);

  // View icon mapping
  const VIEW_ICONS: Record<ViewIconType, React.ComponentType<{ className?: string }>> = {
    list: List,
    grid: LayoutGrid,
    kanban: Columns3,
    calendar: CalendarIcon,
    gantt: GanttIcon,
    table: Table,
    timeline: Clock,
    map: MapPin,
    gallery: Image,
  };

  return (
    <div className={listPageToolbarVariants({ inverted, className })}>
      {/* Header */}
      <div className={listPageToolbarHeaderVariants({ inverted })}>
        {/* Title */}
        <h1 className={listPageToolbarTitleVariants({ inverted })}>
          {title}
        </h1>

        {/* Actions */}
        <div className={listPageToolbarActionsVariants({ inverted })}>
          {onCreate && (
            <button
              onClick={onCreate}
              className={listPageToolbarButtonVariants({ variant: "primary", inverted })}
            >
              {createLabel}
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className={listPageToolbarControlsVariants({ inverted })}>
        {/* Search */}
        <div className={listPageToolbarSearchVariants({ inverted })}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className={`w-full pl-10 pr-4 py-2 border-2 rounded-button bg-surface-elevated border-border text-text-primary placeholder-text-text-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-primary)] ${
                inverted ? "bg-surface-elevated-inverse border-border-inverse text-text-inverse placeholder-text-text-muted-inverse" : ""
              }`}
            />
          </div>
        </div>

        {/* Left Controls */}
        <div className={listPageToolbarActionsVariants({ inverted })}>
          {/* Filters */}
          {filters && filters.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={listPageToolbarButtonVariants({ variant: "default", inverted })}
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount && activeFilterCount > 0 && (
                  <span className="px-2 py-1 text-xs bg-brand-primary text-white rounded-badge">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>
            </div>
          )}

          {/* Views */}
          {views && views.length > 1 && (
            <div className="flex items-center gap-1 border-2 rounded-button bg-surface-elevated border-border">
              {views.map((view) => {
                const Icon = VIEW_ICONS[view.icon];
                return (
                  <button
                    key={view.id}
                    onClick={() => onViewChange?.(view.id)}
                    className={`p-2 rounded-button transition-colors ${
                      activeView === view.id
                        ? "bg-brand-primary text-white"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    }`}
                    title={view.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Density */}
          {onDensityChange && (
            <div className="relative">
              <button
                onClick={() => setShowDensity(!showDensity)}
                className={listPageToolbarButtonVariants({ variant: "ghost", inverted })}
              >
                <MoreHorizontal className="w-4 h-4" />
                Density
                <ChevronDown className={`w-4 h-4 transition-transform ${showDensity ? "rotate-180" : ""}`} />
              </button>
            </div>
          )}

          {/* Refresh */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className={listPageToolbarButtonVariants({ variant: "ghost", inverted })}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          )}

          {/* Import/Export */}
          {(onImport || onExport) && (
            <div className="flex items-center gap-1">
              {onImport && (
                <button
                  onClick={onImport}
                  className={listPageToolbarButtonVariants({ variant: "ghost", inverted })}
                >
                  <Upload className="w-4 h-4" />
                  Import
                </button>
              )}
              {onExport && (
                <button
                  onClick={onExport}
                  className={listPageToolbarButtonVariants({ variant: "ghost", inverted })}
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              )}
            </div>
          )}

          {/* Quick Actions */}
          {quickActions && quickActions.length > 0 && (
            <div className="flex items-center gap-1">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  className={listPageToolbarButtonVariants({ variant: "ghost", inverted })}
                >
                  {action.icon && <span>{action.icon}</span>}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Saved Filters Slot */}
        {savedFiltersSlot && (
          <div className="flex-1">
            {savedFiltersSlot}
          </div>
        )}
      </div>

      {/* Dropdowns (simplified for this migration) */}
      {showFilters && (
        <div className="absolute top-full left-0 mt-1 w-full border-2 rounded-[var(--radius-card)] shadow-hard-lg bg-surface-elevated border-border z-dropdown p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-text-primary">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-1 text-text-muted hover:text-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {filters?.map((filter) => (
            <div key={filter.key} className="mb-4">
              <label className="block text-sm font-medium text-text-primary mb-2">
                {filter.label}
              </label>
              <select
                value={activeFilters?.[filter.key] || ""}
                onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                className="w-full px-3 py-2 border-2 rounded-button bg-surface-primary border-border text-text-primary"
              >
                <option value="">All</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          {activeFilterCount && activeFilterCount > 0 && (
            <button
              onClick={onClearFilters}
              className="w-full px-4 py-2 border-2 rounded-button bg-error-50 border-error-500 text-error-900 hover:bg-error-100"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
