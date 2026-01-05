import type { ReactNode, HTMLAttributes } from "react";

/**
 * Context breadcrumb item
 */
export interface ContextItem {
  id: string;
  name: string;
  slug: string;
  icon?: ReactNode;
  badge?: string;
  color?: string;
}

/**
 * Context breadcrumb level
 */
export interface ContextLevel {
  label: string;
  current: ContextItem | null;
  items: ContextItem[];
  onSelect: (item: ContextItem) => void;
  onSearch?: (query: string) => Promise<ContextItem[]>;
  onCreate?: () => void;
  createLabel?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
}

/**
 * ContextBreadcrumb component props
 */
export interface ContextBreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Array of context levels (e.g., [organization, project, activation]) */
  levels: ContextLevel[];
  
  /** Logo/home element */
  logo?: ReactNode;
  
  /** Separator between breadcrumb items */
  separator?: ReactNode;
  
  /** Inverted color scheme (dark background) */
  inverted?: boolean;
  
  /** Maximum visible levels on mobile (rest collapse to menu) */
  maxMobileLevels?: number;
}
