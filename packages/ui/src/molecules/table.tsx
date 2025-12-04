"use client";

import { forwardRef, createContext, useContext } from "react";
import clsx from "clsx";
import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

export type TableVariant = "default" | "bordered" | "striped" | "dark" | "dark-striped";

export type TableProps = HTMLAttributes<HTMLTableElement> & {
  variant?: TableVariant;
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
  function Table({ variant = "default", className, children, ...props }, ref) {
    const isDark = variant === "dark" || variant === "dark-striped";
    
    return (
      <TableContext.Provider value={{ variant }}>
        <div className={clsx(
          "w-full overflow-x-auto border-2 rounded-[var(--radius-card)] shadow-[4px_4px_0_rgba(0,0,0,0.1)]",
          isDark ? "border-grey-700" : "border-black"
        )}>
          <table
            ref={ref}
            className={clsx(
              "w-full text-left text-sm",
              variant === "striped" && "[&_tbody_tr:nth-child(even)]:bg-grey-50",
              variant === "dark-striped" && "[&_tbody_tr:nth-child(even)]:bg-grey-800",
              className
            )}
            {...props}
          >
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
            ? "bg-grey-900 text-white border-grey-700" 
            : "bg-black text-white border-black",
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
          isDark ? "bg-grey-900" : "bg-white",
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
            ? "border-grey-700 hover:bg-grey-800 hover:-translate-x-0.5" 
            : "border-grey-200 hover:bg-grey-50 hover:-translate-x-0.5",
          selected && (isDark 
            ? "bg-grey-800 border-l-4 border-l-white" 
            : "bg-grey-100 border-l-4 border-l-black"),
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
          sortable && "cursor-pointer hover:bg-grey-900 transition-colors",
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
          isDark ? "text-grey-200" : "text-grey-900",
          className
        )}
        {...props}
      >
        {children}
      </td>
    );
  }
);
