import { forwardRef } from "react";
import { paginationVariants } from "./Pagination.variants.js";
import { PaginationItem } from "./PaginationItem.js";
import type { PaginationProps } from "./Pagination.types.js";

/**
 * Pagination component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders on interactive elements
 * - Clear visual hierarchy
 * - Accessible navigation
 * - Smart pagination with ellipsis
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   onPageChange={(page) => console.log('Page:', page)}
 *   siblingCount={2}
 * />
 * ```
 */
export const Pagination = forwardRef<HTMLDivElement, PaginationProps>(
  function Pagination({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    siblingCount = 1, 
    inverted = false, 
    className, 
    ...props 
  }, ref) {
    const range = (start: number, end: number) => {
      const length = end - start + 1;
      return Array.from({ length }, (_, idx) => start + idx);
    };

    const generatePagination = () => {
      const totalPageNumbers = siblingCount + 5;

      if (totalPageNumbers >= totalPages) {
        return range(1, totalPages);
      }

      const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
      const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

      const firstPageIndex = 1;
      const lastPageIndex = totalPages;

      if (!shouldShowLeftDots && shouldShowRightDots) {
        const leftItemCount = 3 + 2 * siblingCount;
        const leftRange = range(1, leftItemCount);
        return [...leftRange, "...", totalPages];
      }

      if (shouldShowLeftDots && !shouldShowRightDots) {
        const rightItemCount = 3 + 2 * siblingCount;
        const rightRange = range(totalPages - rightItemCount + 1, totalPages);
        return [firstPageIndex, "...", ...rightRange];
      }

      if (shouldShowLeftDots && shouldShowRightDots) {
        const middleRange = range(leftSiblingIndex, rightSiblingIndex);
        return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
      }

      return range(1, totalPages);
    };

    const paginationItems = generatePagination();

    return (
      <nav
        ref={ref}
        className={paginationVariants({ className })}
        aria-label="Pagination navigation"
        {...props}
      >
        {paginationItems.map((item, index) => {
          if (item === "...") {
            return (
              <PaginationItem 
                key={`dots-${index}`}
                dots
                inverted={inverted}
              />
            );
          }

          const pageNum = typeof item === 'number' ? item : parseInt(item, 10);
          
          return (
            <PaginationItem
              key={item}
              page={pageNum}
              active={pageNum === currentPage}
              disabled={pageNum === currentPage}
              inverted={inverted}
              onClick={() => onPageChange(pageNum)}
            >
              {item}
            </PaginationItem>
          );
        })}
      </nav>
    );
  }
);

Pagination.displayName = "Pagination";
