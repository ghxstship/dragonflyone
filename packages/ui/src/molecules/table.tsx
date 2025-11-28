import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

export type TableProps = HTMLAttributes<HTMLTableElement> & {
  variant?: "default" | "bordered" | "striped";
};

/**
 * Table component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold 2px border wrapper
 * - High contrast header
 * - Clear row separation
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(
  function Table({ variant = "default", className, children, ...props }, ref) {
    return (
      <div className="w-full overflow-x-auto border-2 border-black rounded-[var(--radius-card)] shadow-[4px_4px_0_rgba(0,0,0,0.1)]">
        <table
          ref={ref}
          className={clsx(
            "w-full text-left text-sm",
            variant === "striped" && "[&_tbody_tr:nth-child(even)]:bg-grey-50",
            className
          )}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableHeader({ className, children, ...props }, ref) {
    return (
      <thead
        ref={ref}
        className={clsx("bg-black text-white border-b-2 border-black", className)}
        {...props}
      >
        {children}
      </thead>
    );
  }
);

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableBody({ className, children, ...props }, ref) {
    return (
      <tbody ref={ref} className={clsx("bg-white", className)} {...props}>
        {children}
      </tbody>
    );
  }
);

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement> & { selected?: boolean }>(
  function TableRow({ selected, className, children, ...props }, ref) {
    return (
      <tr
        ref={ref}
        className={clsx(
          "border-b-2 border-grey-200 transition-all duration-100",
          "hover:bg-grey-50 hover:-translate-x-0.5",
          selected && "bg-grey-100 border-l-4 border-l-black",
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
    return (
      <td
        ref={ref}
        className={clsx("px-4 py-3 font-body text-sm", className)}
        {...props}
      >
        {children}
      </td>
    );
  }
);
