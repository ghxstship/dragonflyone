"use client";

import { forwardRef, ReactNode, useState } from "react";
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

// =============================================================================
// TYPES
// =============================================================================

// BreadcrumbItem imported from canonical types
import type { BreadcrumbItem } from "../types/breadcrumb.js";
export type { BreadcrumbItem } from "../types/breadcrumb.js";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

export interface ViewOption {
  id: string;
  label: string;
  icon: "list" | "grid" | "kanban" | "calendar" | "gantt" | "table";
}

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Subtitle or description */
  subtitle?: string;
  /** Breadcrumb navigation */
  breadcrumbs?: BreadcrumbItem[];
  /** Tab navigation */
  tabs?: TabItem[];
  /** Active tab ID */
  activeTab?: string;
  /** Tab change handler */
  onTabChange?: (tabId: string) => void;
  /** View options */
  views?: ViewOption[];
  /** Active view ID */
  activeView?: string;
  /** View change handler */
  onViewChange?: (viewId: string) => void;
  /** Primary action button */
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  /** Secondary actions (dropdown) */
  secondaryActions?: Array<{
    id: string;
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    variant?: "default" | "danger";
  }>;
  /** Show favorite toggle */
  showFavorite?: boolean;
  /** Is favorited */
  isFavorited?: boolean;
  /** Favorite toggle handler */
  onFavoriteToggle?: () => void;
  /** Show share button */
  showShare?: boolean;
  /** Share handler */
  onShare?: () => void;
  /** Show settings button */
  showSettings?: boolean;
  /** Settings handler */
  onSettings?: () => void;
  /** Search enabled */
  searchEnabled?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Search value */
  searchValue?: string;
  /** Search change handler */
  onSearchChange?: (value: string) => void;
  /** Filter count */
  filterCount?: number;
  /** Filter click handler */
  onFilterClick?: () => void;
  /** Sort click handler */
  onSortClick?: () => void;
  /** Custom right-side content */
  rightContent?: ReactNode;
  /** Dark mode */
  inverted?: boolean;
  /** Sticky header */
  sticky?: boolean;
  /** Additional className */
  className?: string;
}

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

// =============================================================================
// PAGE HEADER COMPONENT
// =============================================================================

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
        className={clsx(
          "border-b-2",
          sticky && "sticky top-0 z-sticky-header",
          inverted 
            ? "bg-surface-inverse border-border" 
            : "bg-surface-primary border-border",
          className
        )}
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
                    className={inverted ? "text-on-dark-disabled" : "text-on-light-disabled"} 
                  />
                )}
                {crumb.icon && (
                  <span className={inverted ? "text-on-dark-muted" : "text-on-light-muted"}>
                    {crumb.icon}
                  </span>
                )}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className={clsx(
                      "hover:underline transition-colors",
                      inverted 
                        ? "text-on-dark-muted hover:text-on-dark-primary" 
                        : "text-on-light-muted hover:text-on-light-primary"
                    )}
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className={inverted ? "text-on-dark-secondary" : "text-on-light-secondary"} aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}>
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
                inverted ? "text-on-dark-primary" : "text-on-light-primary"
              )}>
                {title}
              </h1>
              {subtitle && (
                <p className={clsx(
                  "text-sm mt-0.5 truncate",
                  inverted ? "text-on-dark-muted" : "text-on-light-muted"
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
                        ? "text-on-dark-muted hover:text-on-dark-secondary" 
                        : "text-on-light-muted hover:text-on-light-secondary"
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
                      ? "text-on-dark-disabled hover:text-on-dark-secondary" 
                      : "text-on-light-disabled hover:text-on-light-secondary"
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
                      ? "text-on-dark-disabled hover:text-on-dark-secondary" 
                      : "text-on-light-disabled hover:text-on-light-secondary"
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
                    <Search size={16} className={inverted ? "text-on-dark-muted" : "text-on-light-muted"} />
                    <input
                      type="text"
                      value={searchValue}
                      onChange={(e) => onSearchChange?.(e.target.value)}
                      placeholder={searchPlaceholder}
                      className={clsx(
                        "w-48 bg-transparent text-sm outline-none",
                        inverted ? "text-on-dark-primary placeholder:text-on-dark-muted" : "text-on-light-primary placeholder:text-on-light-muted"
                      )}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => { setShowSearch(false); onSearchChange?.(""); }}
                      className={inverted ? "text-on-dark-muted hover:text-on-dark-secondary" : "text-on-light-muted hover:text-on-light-secondary"}
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
                        ? "border-border text-on-dark-muted hover:text-on-dark-primary hover:border-border-primary" 
                        : "border-border text-on-light-muted hover:text-on-light-secondary hover:border-border-primary"
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
                      ? "border-border text-on-dark-muted hover:text-on-dark-primary hover:border-border-primary" 
                      : "border-border text-on-light-muted hover:text-on-light-primary hover:border-border-primary"
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
                    ? "border-border text-on-dark-muted hover:text-on-dark-primary hover:border-border-primary" 
                    : "border-border text-on-light-muted hover:text-on-light-primary hover:border-border-primary"
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
                            ? "bg-surface-elevated text-on-dark-primary" 
                            : "bg-muted text-on-light-primary"
                          : inverted 
                            ? "text-on-dark-muted hover:text-on-dark-primary hover:bg-surface-elevated" 
                            : "text-on-light-muted hover:text-on-light-secondary hover:bg-muted"
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
                      ? "border-border text-on-dark-muted hover:text-on-dark-primary hover:border-border-primary" 
                      : "border-border text-on-light-muted hover:text-on-light-primary hover:border-border-primary"
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
                                ? "text-on-dark-secondary hover:bg-surface-elevated hover:text-on-dark-primary" 
                                : "text-on-light-secondary hover:bg-muted"
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
                    ? "bg-surface-primary text-on-light-primary border-surface-primary shadow-primary-500 hover:shadow-primary-400" 
                    : "bg-surface-inverse text-on-dark-primary border-surface-inverse shadow-primary-500 hover:shadow-primary-400"
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
                        : "border-primary-500 text-on-light-primary"
                      : inverted 
                        ? "border-transparent text-on-dark-muted hover:text-on-dark-secondary" 
                        : "border-transparent text-on-light-muted hover:text-on-light-secondary"
                  )}
                >
                  {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={clsx(
                      "px-1.5 py-0.5 text-xs rounded",
                      isActive
                        ? inverted ? "bg-primary-500/20 text-primary-400" : "bg-primary-100 text-primary-600"
                        : inverted ? "bg-surface-elevated text-on-dark-muted" : "bg-muted text-on-light-muted"
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
