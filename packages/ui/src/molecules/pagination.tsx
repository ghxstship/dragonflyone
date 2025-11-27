import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type PaginationProps = HTMLAttributes<HTMLDivElement> & {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  inverted?: boolean;
};

export const Pagination = forwardRef<HTMLDivElement, PaginationProps>(
  function Pagination({ currentPage, totalPages, onPageChange, siblingCount = 1, inverted = false, className, ...props }, ref) {
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

      return [];
    };

    const paginationRange = generatePagination();

    const navButtonClasses = inverted
      ? "px-spacing-3 py-spacing-2 border-2 border-grey-500 text-grey-200 bg-transparent hover:bg-white hover:text-black hover:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-base font-heading uppercase text-mono-sm"
      : "px-spacing-3 py-spacing-2 border-2 border-black text-black bg-white hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-base font-heading uppercase text-mono-sm";

    return (
      <div
        ref={ref}
        className={clsx("flex flex-wrap items-center justify-center gap-gap-xs", className)}
        {...props}
      >
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={navButtonClasses}
        >
          Previous
        </button>

        {paginationRange.map((pageNumber, index) => {
          if (pageNumber === "...") {
            return (
              <span key={`dots-${index}`} className={clsx("px-spacing-2", inverted ? "text-grey-500" : "text-grey-500")}>
                ...
              </span>
            );
          }

          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber as number)}
              className={clsx(
                "px-spacing-4 py-spacing-2 border-2 transition-colors duration-base font-heading uppercase text-mono-sm min-w-spacing-11",
                currentPage === pageNumber
                  ? inverted
                    ? "border-white bg-white text-black"
                    : "border-black bg-black text-white"
                  : inverted
                    ? "border-grey-600 bg-transparent text-grey-300 hover:border-grey-400"
                    : "border-grey-300 bg-white text-black hover:border-black"
              )}
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={navButtonClasses}
        >
          Next
        </button>
      </div>
    );
  }
);
