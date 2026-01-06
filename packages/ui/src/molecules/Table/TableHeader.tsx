"use client";

import React, { forwardRef } from "react";
import clsx from "clsx";
import { ArrowUpDown } from "lucide-react";
import { tableHeaderVariants, tableHeaderCellVariants } from "./TableHeader.variants.js";
import type { TableHeaderProps } from "./TableHeader.types.js";

/**
 * TableHeader - Reusable table header molecule
 *
 * @example
 * ```tsx
 * <TableHeader>
 *   <TableHeaderCell sortable onSort={() => {}}>Column 1</TableHeaderCell>
 *   <TableHeaderCell>Column 2</TableHeaderCell>
 * </TableHeader>
 * ```
 */
export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  function TableHeader({ sticky = true, className, children, ...props }: TableHeaderProps, ref: React.Ref<HTMLTableSectionElement>) {
    return (
      <thead 
        ref={ref}
        className={tableHeaderVariants({ sticky, className })}
        {...props}
      >
        {children}
      </thead>
    );
  }
);

export function TableHeaderCell({
  children,
  sortable = false,
  onSort,
  align = "left",
  className,
  ...props
}: {
  children: React.ReactNode;
  sortable?: boolean;
  onSort?: () => void;
  align?: "left" | "center" | "right";
  className?: string;
}) {
  return (
    <th
      className={clsx(tableHeaderCellVariants({ align, sortable, className }))}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && <ArrowUpDown className="w-3 h-3" />}
      </div>
    </th>
  );
}

export default TableHeader;
