/**
 * Pagination Component
 * Page navigation controls
 */

import React, { forwardRef } from 'react';
import { Flex } from '../../primitives/flex';
import { Button } from '../../primitives/button';
import { cn } from '../../utils/cn';

export interface PaginationProps {
  /**
   * Current page (1-indexed)
   */
  currentPage: number;

  /**
   * Total number of pages
   */
  totalPages: number;

  /**
   * Page change handler
   */
  onPageChange: (page: number) => void;

  /**
   * Number of page buttons to show
   */
  siblingCount?: number;

  /**
   * Show first/last page buttons
   */
  showFirstLast?: boolean;

  /**
   * Additional class names
   */
  className?: string;
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    currentPage,
    totalPages,
    onPageChange,
    siblingCount = 1,
    showFirstLast = true,
    className,
  },
  ref
) {
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    const leftSibling = Math.max(2, currentPage - siblingCount);
    const rightSibling = Math.min(totalPages - 1, currentPage + siblingCount);

    // Add ellipsis if needed
    if (leftSibling > 2) {
      pages.push('...');
    }

    // Add page numbers around current
    for (let i = leftSibling; i <= rightSibling; i++) {
      pages.push(i);
    }

    // Add ellipsis if needed
    if (rightSibling < totalPages - 1) {
      pages.push('...');
    }

    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = generatePageNumbers();
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <nav ref={ref} aria-label="Pagination" className={cn('', className)}>
      <Flex align="center" gap="1">
        {/* First page button */}
        {showFirstLast && (
          <Button
            onClick={() => onPageChange(1)}
            disabled={isFirstPage}
            className="px-3 py-2 rounded-md border border-border-primary disabled:opacity-50"
            aria-label="First page"
          >
            «
          </Button>
        )}

        {/* Previous button */}
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          className="px-3 py-2 rounded-md border border-border-primary disabled:opacity-50"
          aria-label="Previous page"
        >
          ‹
        </Button>

        {/* Page numbers */}
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-text-tertiary">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <Button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={cn(
                'px-3 py-2 rounded-md border transition-colors',
                isActive
                  ? 'border-border-brand bg-surface-brand text-text-on-brand'
                  : 'border-border-primary hover:bg-surface-secondary'
              )}
              aria-label={`Page ${pageNum}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </Button>
          );
        })}

        {/* Next button */}
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          className="px-3 py-2 rounded-md border border-border-primary disabled:opacity-50"
          aria-label="Next page"
        >
          ›
        </Button>

        {/* Last page button */}
        {showFirstLast && (
          <Button
            onClick={() => onPageChange(totalPages)}
            disabled={isLastPage}
            className="px-3 py-2 rounded-md border border-border-primary disabled:opacity-50"
            aria-label="Last page"
          >
            »
          </Button>
        )}
      </Flex>
    </nav>
  );
});
