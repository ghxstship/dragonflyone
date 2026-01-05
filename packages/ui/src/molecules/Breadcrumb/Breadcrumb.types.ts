import type { HTMLAttributes, ReactNode } from "react";

/**
 * Breadcrumb container props
 */
export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /** Custom separator */
  separator?: ReactNode;
  
  /** Inverted theme */
  inverted?: boolean;
}

/**
 * Breadcrumb item props
 */
export interface BreadcrumbItemProps extends HTMLAttributes<HTMLLIElement> {
  /** Link href */
  href?: string;
  
  /** Active state */
  active?: boolean;
  
  /** Inverted theme */
  inverted?: boolean;
}
