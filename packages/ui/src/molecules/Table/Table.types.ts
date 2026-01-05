import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

/**
 * Table variant
 */
export type TableVariant = "default" | "bordered" | "striped" | "dark" | "dark-striped";

/**
 * Table component props
 */
export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  variant?: TableVariant;
  /** Accessible caption for screen readers */
  caption?: string;
  /** Hide caption visually but keep for screen readers */
  captionHidden?: boolean;
  /** Description ID for aria-describedby (reference to external description) */
  describedBy?: string;
  inverted?: boolean;
}

/**
 * TableHeader component props
 */
export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  inverted?: boolean;
}

/**
 * TableBody component props
 */
export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  inverted?: boolean;
}

/**
 * TableRow component props
 */
export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  inverted?: boolean;
}

/**
 * TableHead component props
 */
export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  inverted?: boolean;
}

/**
 * TableCell component props
 */
export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  inverted?: boolean;
}
