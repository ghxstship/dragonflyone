import { forwardRef } from "react";
import { paginationItemVariants } from "./Pagination.variants.js";
import type { PaginationItemProps } from "./Pagination.types.js";

/**
 * PaginationItem component
 * 
 * An individual pagination button or dots indicator.
 * 
 * @example
 * ```tsx
 * <PaginationItem page={1} active={false} onClick={() => console.log('Page 1')}>
 *   1
 * </PaginationItem>
 * 
 * <PaginationItem dots>
 *   ...
 * </PaginationItem>
 * ```
 */
export const PaginationItem = forwardRef<HTMLButtonElement, PaginationItemProps>(
  function PaginationItem({ 
    page, 
    active = false, 
    disabled = false, 
    inverted = false, 
    onClick, 
    className, 
    children, 
    ...props 
  }, ref) {
    if (children === "...") {
      // Dots indicator
      return (
        <div className="flex items-center justify-center w-10 h-10 text-text-muted font-body text-sm">
          ...
        </div>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        onClick={onClick}
        className={paginationItemVariants({ active, disabled, className })}
        aria-current={active ? "page" : undefined}
        aria-label={`Go to page ${page}`}
        {...props}
      >
        {children || page}
      </button>
    );
  }
);

PaginationItem.displayName = "PaginationItem";
