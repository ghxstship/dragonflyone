import type { HTMLAttributes } from "react";

/**
 * Pagination component props
 */
export interface PaginationProps extends HTMLAttributes<HTMLDivElement> {
  /** Current page number */
  currentPage: number;
  
  /** Total number of pages */
  totalPages: number;
  
  /** Page change handler */
  onPageChange: (page: number) => void;
  
  /** Number of sibling pages to show */
  siblingCount?: number;
  
  /** Inverted theme */
  inverted?: boolean;
}

/**
 * Pagination item props
 */
export interface PaginationItemProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'page'> {
  /** Page number */
  page?: number;
  
  /** Active state */
  active?: boolean;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Inverted theme */
  inverted?: boolean;
  
  /** Click handler */
  onClick?: () => void;
  
  /** Dots indicator */
  dots?: boolean;
}
