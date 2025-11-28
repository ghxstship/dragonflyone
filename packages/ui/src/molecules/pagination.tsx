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
      ? "px-spacing-3 py-spacing-2 border-2 border-grey-500 text-grey-200 bg-transparent rounded-[var(--radius-button)] shadow-[2px_2px_0_rgba(255,255,255,0.1)] hover:bg-white hover:text-black hover:border-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_rgba(255,255,255,0.2)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100 ease-[var(--ease-bounce)] font-heading uppercase text-mono-sm"
      : "px-spacing-3 py-spacing-2 border-2 border-black text-black bg-white rounded-[var(--radius-button)] shadow-[2px_2px_0_rgba(0,0,0,0.1)] hover:bg-black hover:text-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_rgba(0,0,0,0.15)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0_rgba(0,0,0,0.1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100 ease-[var(--ease-bounce)] font-heading uppercase text-mono-sm";

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
                "px-spacing-4 py-spacing-2 border-2 rounded-[var(--radius-button)] transition-all duration-100 ease-[var(--ease-bounce)] font-heading uppercase text-mono-sm min-w-spacing-11",
                currentPage === pageNumber
                  ? inverted
                    ? "border-white bg-white text-black shadow-[3px_3px_0_hsl(239,84%,67%)]"
                    : "border-black bg-black text-white shadow-[3px_3px_0_hsl(239,84%,67%)]"
                  : inverted
                    ? "border-grey-600 bg-transparent text-grey-300 shadow-[2px_2px_0_rgba(255,255,255,0.1)] hover:border-grey-400 hover:-translate-x-0.5 hover:-translate-y-0.5"
                    : "border-grey-300 bg-white text-black shadow-[2px_2px_0_rgba(0,0,0,0.08)] hover:border-black hover:-translate-x-0.5 hover:-translate-y-0.5"
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
