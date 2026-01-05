"use client";

import { forwardRef, useState } from "react";
import clsx from "clsx";
import { 
  ChevronRight, 
  LayoutGrid, 
  List, 
  Kanban, 
  Calendar,
  GanttChart,
  Table2,
  Plus,
  MoreHorizontal,
  Star,
  Share2,
  Settings,
  Filter,
  SortAsc,
  Search,
  X
} from "lucide-react";
import { pageHeaderVariants } from "./PageHeader.variants.js";
import type { 
  PageHeaderProps,
  BreadcrumbItem
} from "./PageHeader.types.js";

// =============================================================================
// VIEW ICONS
// =============================================================================

const viewIcons = {
  list: List,
  grid: LayoutGrid,
  kanban: Kanban,
  calendar: Calendar,
  gantt: GanttChart,
  table: Table2,
};

/**
 * PageHeader component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Comprehensive page header with breadcrumbs, tabs, and actions
 * - Search functionality with toggle input
 * - View switcher for different data layouts
 * - Filter and sort controls with count badges
 * - Favorite, share, and settings actions
 * - Primary and secondary action buttons
 * - Sticky positioning option
 * - Responsive design
 */
export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
  function PageHeader(
    {
      title,
      subtitle,
      breadcrumbs,
      tabs,
      activeTab,
      onTabChange,
      views,
      activeView,
      onViewChange,
      primaryAction,
      secondaryActions,
      showFavorite,
      isFavorited,
      onFavoriteToggle,
      showShare,
      onShare,
      showSettings,
      onSettings,
      searchEnabled,
      searchPlaceholder = "Search...",
      searchValue = "",
      onSearchChange,
      filterCount = 0,
      onFilterClick,
      onSortClick,
      rightContent,
      inverted = true,
      sticky = true,
      className,
    },
    ref
  ) {
    const [showSearch, setShowSearch] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState(false);

    return (
      <div
        ref={ref}
        className={clsx(pageHeaderVariants({ sticky, inverted }), className)}
      >
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav 
            aria-label="Breadcrumb"
            className={clsx(
              "flex items-center gap-1 px-6 py-2 text-sm border-b",
              inverted ? "border-border/50" : "border-border"
            )}
          >
            <ol className="flex items-center gap-1">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center gap-1">
                {index > 0 && (
                  <ChevronRight 
                    size={14} 
                    className={inverted ? "text-text-disabled" : "text-text-disabled"} 
                  />
                )}
                {crumb.icon && (
                  <span className={inverted ? "text-text-muted" : "text-text-muted"}>
                    {crumb.icon}
                  </span>
                )}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className={clsx(
                      "hover:underline transition-colors",
                      inverted 
                        ? "text-text-muted hover:text-text-primary" 
                        : "text-text-muted hover:text-text-primary"
                    )}
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className={inverted ? "text-text-secondary" : "text-text-secondary"} aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}>
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
            </ol>
          </nav>
        )}

        {/* Main Header Row */}
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          {/* Left: Title + Actions */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="min-w-0">
              <h1 className={clsx(
                "font-display text-xl font-bold tracking-tight truncate",
                inverted ? "text-text-primary" : "text-text-primary"
              )}>
                {title}
              </h1>
              {subtitle && (
                <p className={clsx(
                  "text-sm mt-0.5 truncate",
                  inverted ? "text-text-muted" : "text-text-muted"
                )}>
                  {subtitle}
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1">
              {showFavorite && (
                <button
                  type="button"
                  onClick={onFavoriteToggle}
                  className={clsx(
                    "p-1.5 rounded transition-colors",
                    isFavorited
                      ? "text-accent-500"
                      : inverted 
                        ? "text-text-muted hover:text-text-secondary" 
                        : "text-text-muted hover:text-text-secondary"
                  )}
                  aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star size={18} fill={isFavorited ? "currentColor" : "none"} />
                </button>
              )}
              {showShare && (
                <button
                  type="button"
                  onClick={onShare}
                  className={clsx(
                    "p-1.5 rounded transition-colors",
                    inverted 
                      ? "text-text-disabled hover:text-text-secondary" 
                      : "text-text-disabled hover:text-text-secondary"
                  )}
                  aria-label="Share"
                >
                  <Share2 size={18} />
                </button>
              )}
              {showSettings && (
                <button
                  type="button"
                  onClick={onSettings}
                  className={clsx(
                    "p-1.5 rounded transition-colors",
                    inverted 
                      ? "text-text-disabled hover:text-text-secondary" 
                      : "text-text-disabled hover:text-text-secondary"
                  )}
                  aria-label="Settings"
                >
                  <Settings size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {rightContent}

            {/* Search Toggle */}
            {searchEnabled && (
              <>
                {showSearch ? (
                  <div className={clsx(
                    "flex items-center gap-2 px-3 py-1.5 rounded border-2",
                    inverted 
                      ? "bg-surface-inverse border-border" 
                      : "bg-surface-primary border-border"
                  )}>
                    <Search size={16} className={inverted ? "text-text-muted" : "text-text-muted"} />
                    <input
                      type="text"
                      value={searchValue}
                      onChange={(e) => onSearchChange?.(e.target.value)}
                      placeholder={searchPlaceholder}
                      className={clsx(
                        "w-48 bg-transparent text-sm outline-none",
                        inverted ? "text-text-primary placeholder:text-text-muted" : "text-text-primary placeholder:text-text-muted"
                      )}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => { setShowSearch(false); onSearchChange?.(""); }}
                      className={inverted ? "text-text-muted hover:text-text-secondary" : "text-text-muted hover:text-text-secondary"}
                      aria-label="Clear search"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSearch(true)}
                    className={clsx(
                      "p-2 rounded border-2 transition-colors",
                      inverted 
                        ? "border-border text-text-muted hover:text-text-primary hover:border-border-primary" 
                        : "border-border text-text-muted hover:text-text-secondary hover:border-border-primary"
                    )}
                    aria-label="Search"
                  >
                    <Search size={18} />
                  </button>
                )}
              </>
            )}

            {/* Filter Button */}
            {onFilterClick && (
              <button
                type="button"
                onClick={onFilterClick}
                aria-label={filterCount > 0 ? `Filter (${filterCount} active)` : "Filter"}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-2 rounded border-2 text-sm font-medium transition-colors",
                  filterCount > 0
                    ? inverted 
                      ? "border-primary-500 bg-primary-500/10 text-primary-400" 
                      : "border-primary-500 bg-primary-50 text-primary-600"
                    : inverted 
                      ? "border-border text-text-muted hover:text-text-primary hover:border-border-primary" 
                      : "border-border text-text-muted hover:text-text-primary hover:border-border-primary"
                )}
              >
                <Filter size={16} aria-hidden="true" />
                <span>Filter</span>
                {filterCount > 0 && (
                  <span className={clsx(
                    "px-1.5 py-0.5 text-xs rounded-full",
                    inverted ? "bg-primary-500 text-white" : "bg-primary-500 text-white"
                  )}>
                    {filterCount}
                  </span>
                )}
              </button>
            )}

            {/* Sort Button */}
            {onSortClick && (
              <button
                type="button"
                onClick={onSortClick}
                className={clsx(
                  "p-2 rounded border-2 transition-colors",
                  inverted 
                    ? "border-border text-text-muted hover:text-text-primary hover:border-border-primary" 
                    : "border-border text-text-muted hover:text-text-primary hover:border-border-primary"
                )}
                aria-label="Sort"
              >
                <SortAsc size={18} />
              </button>
            )}

            {/* View Switcher */}
            {views && views.length > 0 && (
              <div className={clsx(
                "flex items-center rounded border-2 overflow-hidden",
                inverted ? "border-border" : "border-border"
              )}>
                {views.map((view) => {
                  const Icon = viewIcons[view.icon];
                  const isActive = activeView === view.id;
                  return (
                    <button
                      key={view.id}
                      type="button"
                      onClick={() => onViewChange?.(view.id)}
                      className={clsx(
                        "p-2 transition-colors",
                        isActive
                          ? inverted 
                            ? "bg-surface-elevated text-text-primary" 
                            : "bg-muted text-text-primary"
                          : inverted 
                            ? "text-text-muted hover:text-text-primary hover:bg-surface-elevated" 
                            : "text-text-muted hover:text-text-secondary hover:bg-muted"
                      )}
                      aria-label={view.label}
                      title={view.label}
                    >
                      <Icon size={18} />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Secondary Actions Menu */}
            {secondaryActions && secondaryActions.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowActionsMenu(!showActionsMenu)}
                  className={clsx(
                    "p-2 rounded border-2 transition-colors",
                    inverted 
                      ? "border-border text-text-muted hover:text-text-primary hover:border-border-primary" 
                      : "border-border text-text-muted hover:text-text-primary hover:border-border-primary"
                  )}
                  aria-label="More actions"
                >
                  <MoreHorizontal size={18} />
                </button>
                {showActionsMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-content-overlay" 
                      onClick={() => setShowActionsMenu(false)} 
                    />
                    <div className={clsx(
                      "absolute right-0 top-full mt-1 min-w-[160px] rounded border-2 shadow-lg z-dropdown",
                      inverted 
                        ? "bg-surface-inverse border-border" 
                        : "bg-surface-primary border-border"
                    )}>
                      {secondaryActions.map((action) => (
                        <button
                          key={action.id}
                          type="button"
                          onClick={() => { action.onClick(); setShowActionsMenu(false); }}
                          className={clsx(
                            "flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors",
                            action.variant === "danger"
                              ? "text-error-500 hover:bg-error-500/10"
                              : inverted 
                                ? "text-text-secondary hover:bg-surface-elevated hover:text-text-primary" 
                                : "text-text-secondary hover:bg-muted"
                          )}
                        >
                          {action.icon}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Primary Action */}
            {primaryAction && (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded border-2 text-sm font-semibold uppercase tracking-wide transition-all",
                  "shadow-[3px_3px_0] hover:shadow-[4px_4px_0] hover:-translate-x-0.5 hover:-translate-y-0.5",
                  inverted 
                    ? "bg-surface-primary text-text-primary border-surface-primary shadow-primary-500 hover:shadow-primary-400" 
                    : "bg-surface-inverse text-text-primary border-surface-inverse shadow-primary-500 hover:shadow-primary-400"
                )}
              >
                {primaryAction.icon || <Plus size={18} />}
                {primaryAction.label}
              </button>
            )}
          </div>
        </div>

        {/* Tabs Row */}
        {tabs && tabs.length > 0 && (
          <div 
            role="tablist"
            aria-label="Page sections"
            className={clsx(
              "flex items-center gap-1 px-6 overflow-x-auto",
              inverted ? "border-t border-border/50" : "border-t border-border"
            )}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  onClick={() => onTabChange?.(tab.id)}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-[2px] transition-colors whitespace-nowrap",
                    isActive
                      ? inverted 
                        ? "border-primary-500 text-white" 
                        : "border-primary-500 text-text-primary"
                      : inverted 
                        ? "border-transparent text-text-muted hover:text-text-secondary" 
                        : "border-transparent text-text-muted hover:text-text-secondary"
                  )}
                >
                  {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={clsx(
                      "px-1.5 py-0.5 text-xs rounded",
                      isActive
                        ? inverted ? "bg-primary-500/20 text-primary-400" : "bg-primary-100 text-primary-600"
                        : inverted ? "bg-surface-elevated text-text-muted" : "bg-muted text-text-muted"
                    )}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

export default PageHeader;
