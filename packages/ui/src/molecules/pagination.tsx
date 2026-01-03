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
      ? "px-spacing-3 py-spacing-2 border-2 border-border text-on-dark-secondary bg-transparent rounded-[var(--radius-button)] shadow-sm hover:bg-surface-primary hover:text-on-light-primary hover:border-on-dark-primary hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-md active:translate-x-0 active:translate-y-0 active:shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100 ease-[var(--ease-bounce)] font-heading uppercase text-mono-sm leading-none"
      : "px-spacing-3 py-spacing-2 border-2 border-border-primary text-on-light-primary bg-surface-primary rounded-[var(--radius-button)] shadow-sm hover:bg-surface-inverse hover:text-on-dark-primary hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-md active:translate-x-0 active:translate-y-0 active:shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100 ease-[var(--ease-bounce)] font-heading uppercase text-mono-sm leading-none";

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
              <span key={`dots-${index}`} className={clsx("px-spacing-2", inverted ? "text-on-dark-disabled" : "text-on-light-muted")}>
                ...
              </span>
            );
          }

          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber as number)}
              className={clsx(
                "px-spacing-4 py-spacing-2 border-2 rounded-[var(--radius-button)] transition-all duration-100 ease-[var(--ease-bounce)] font-heading uppercase text-mono-sm leading-none min-w-spacing-11",
                currentPage === pageNumber
                  ? inverted
                    ? "border-on-dark-primary bg-surface-primary text-on-light-primary shadow-primary"
                    : "border-border-primary bg-surface-inverse text-on-dark-primary shadow-primary"
                  : inverted
                    ? "border-border bg-transparent text-on-dark-secondary shadow-sm hover:border-on-dark-muted hover:-translate-x-0.5 hover:-translate-y-0.5"
                    : "border-border bg-surface-primary text-on-light-primary shadow-sm hover:border-border-primary hover:-translate-x-0.5 hover:-translate-y-0.5"
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
