"use client";

import { forwardRef, createContext, useContext } from "react";
import { 
  tableVariants,
  tableContainerVariants,
  tableHeaderVariants,
  tableBodyVariants,
  tableRowVariants,
  tableHeadVariants,
  tableCellVariants 
} from "./Table.variants.js";
import type { 
  TableProps,
  TableHeaderProps,
  TableBodyProps,
  TableRowProps,
  TableHeadProps,
  TableCellProps,
  TableVariant 
} from "./Table.types.js";

/**
 * Table context
 */
const TableContext = createContext<{ variant: TableVariant; inverted: boolean }>({ 
  variant: "default", 
  inverted: false 
});

/**
 * Hook to use table context
 */
export const useTableContext = () => useContext(TableContext);

/**
 * Table component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Table with various styling variants
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <Table variant="striped" inverted={false}>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Name</TableHead>
 *       <TableHead>Email</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>John Doe</TableCell>
 *       <TableCell>john@example.com</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 * ```
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(
  function Table({ 
    variant = "default" as TableVariant, 
    caption, 
    captionHidden = false, 
    describedBy, 
    inverted = false,
    className, 
    children, 
    ...props 
  }, ref) {
    return (
      <TableContext.Provider value={{ variant, inverted }}>
        <div className={tableContainerVariants({ variant, inverted })}>
          <table
            ref={ref}
            className={tableVariants({ variant, inverted, className })}
            aria-describedby={describedBy}
            {...props}
          >
            {caption && (
              <caption className={captionHidden ? "sr-only" : ""}>
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

Table.displayName = "Table";

/**
 * TableHeader component
 */
export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  function TableHeader({ inverted, className, children, ...props }, ref) {
    const { variant } = useTableContext();
    
    return (
      <thead 
        ref={ref}
        className={tableHeaderVariants({ variant, inverted, className })}
        {...props}
      >
        {children}
      </thead>
    );
  }
);

TableHeader.displayName = "TableHeader";

/**
 * TableBody component
 */
export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  function TableBody({ inverted, className, children, ...props }, ref) {
    return (
      <tbody 
        ref={ref}
        className={tableBodyVariants({ inverted, className })}
        {...props}
      >
        {children}
      </tbody>
    );
  }
);

TableBody.displayName = "TableBody";

/**
 * TableRow component
 */
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  function TableRow({ inverted, className, children, ...props }, ref) {
    const { variant } = useTableContext();
    
    return (
      <tr 
        ref={ref}
        className={tableRowVariants({ variant, hover: true, inverted, className })}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

TableRow.displayName = "TableRow";

/**
 * TableHead component
 */
export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  function TableHead({ inverted, className, children, ...props }, ref) {
    return (
      <th 
        ref={ref}
        className={tableHeadVariants({ inverted, className })}
        {...props}
      >
        {children}
      </th>
    );
  }
);

TableHead.displayName = "TableHead";

/**
 * TableCell component
 */
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  function TableCell({ inverted, className, children, ...props }, ref) {
    return (
      <td 
        ref={ref}
        className={tableCellVariants({ inverted, className })}
        {...props}
      >
        {children}
      </td>
    );
  }
);

TableCell.displayName = "TableCell";
