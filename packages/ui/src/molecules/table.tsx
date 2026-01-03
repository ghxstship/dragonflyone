"use client";

import { forwardRef, createContext, useContext } from "react";
import clsx from "clsx";
import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

export type TableVariant = "default" | "bordered" | "striped" | "dark" | "dark-striped";

export type TableProps = HTMLAttributes<HTMLTableElement> & {
  variant?: TableVariant;
  /** Accessible caption for screen readers */
  caption?: string;
  /** Hide caption visually but keep for screen readers */
  captionHidden?: boolean;
  /** Description ID for aria-describedby (reference to external description) */
  describedBy?: string;
};

/**
 * Table component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold 2px border wrapper
 * - High contrast header
 * - Clear row separation
 */

const TableContext = createContext<{ variant: TableVariant }>({ variant: "default" });
export const useTableContext = () => useContext(TableContext);

export const Table = forwardRef<HTMLTableElement, TableProps>(
  function Table({ variant = "default", caption, captionHidden = false, describedBy, className, children, ...props }, ref) {
    const isDark = variant === "dark" || variant === "dark-striped";
    
    return (
      <TableContext.Provider value={{ variant }}>
        <div className={clsx(
          "w-full overflow-x-auto border-2 rounded-[var(--radius-card)] shadow-md",
          isDark ? "border-border" : "border-border-primary"
        )}>
          <table
            ref={ref}
            className={clsx(
              "w-full text-left text-sm",
              variant === "striped" && "[&_tbody_tr:nth-child(even)]:bg-muted",
              variant === "dark-striped" && "[&_tbody_tr:nth-child(even)]:bg-surface-elevated",
              className
            )}
            aria-describedby={describedBy}
            {...props}
          >
            {caption && (
              <caption className={clsx(
                "text-left font-heading text-sm uppercase tracking-wider py-2 px-4",
                captionHidden && "sr-only",
                isDark ? "text-text-secondary" : "text-text-muted"
              )}>
                {caption}
              </caption>
            )}
            {children}
          </table>
        </div>
      </TableContext.Provider>
    );
  }
);

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableHeader({ className, children, ...props }, ref) {
    const { variant } = useTableContext();
    const isDark = variant === "dark" || variant === "dark-striped";
    
    return (
      <thead
        ref={ref}
        className={clsx(
          "border-b-2",
          isDark 
            ? "bg-surface-inverse text-text-primary border-border" 
            : "bg-surface-inverse text-text-primary border-border-primary",
          className
        )}
        {...props}
      >
        {children}
      </thead>
    );
  }
);

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableBody({ className, children, ...props }, ref) {
    const { variant } = useTableContext();
    const isDark = variant === "dark" || variant === "dark-striped";
    
    return (
      <tbody 
        ref={ref} 
        className={clsx(
          isDark ? "bg-surface-inverse" : "bg-surface-primary",
          className
        )} 
        {...props}
      >
        {children}
      </tbody>
    );
  }
);

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement> & { selected?: boolean }>(
  function TableRow({ selected, className, children, ...props }, ref) {
    const { variant } = useTableContext();
    const isDark = variant === "dark" || variant === "dark-striped";
    
    return (
      <tr
        ref={ref}
        className={clsx(
          "border-b-2 transition-all duration-100",
          isDark 
            ? "border-border hover:bg-surface-elevated hover:-translate-x-0.5" 
            : "border-border hover:bg-muted hover:-translate-x-0.5",
          selected && (isDark 
            ? "bg-surface-elevated border-l-4 border-l-on-dark-primary" 
            : "bg-muted border-l-4 border-l-on-light-primary"),
          className
        )}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

export const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement> & { sortable?: boolean }>(
  function TableHead({ sortable, className, children, ...props }, ref) {
    return (
      <th
        ref={ref}
        className={clsx(
          "px-4 py-3 font-heading text-xs uppercase tracking-wider text-left font-bold",
          sortable && "cursor-pointer hover:bg-surface-elevated transition-colors",
          className
        )}
        {...props}
      >
        {children}
      </th>
    );
  }
);

export const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  function TableCell({ className, children, ...props }, ref) {
    const { variant } = useTableContext();
    const isDark = variant === "dark" || variant === "dark-striped";
    
    return (
      <td
        ref={ref}
        className={clsx(
          "px-4 py-3 font-body text-sm",
          isDark ? "text-text-secondary" : "text-text-primary",
          className
        )}
        {...props}
      >
        {children}
      </td>
    );
  }
);
