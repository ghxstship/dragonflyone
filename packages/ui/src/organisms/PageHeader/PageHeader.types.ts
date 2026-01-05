import type { ReactNode } from 'react';
import type { BreadcrumbItem } from "../../types/breadcrumb.js";

export type { BreadcrumbItem } from "../../types/breadcrumb.js";

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
