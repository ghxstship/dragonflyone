/**
 * GridPage Pattern
 * Complete grid view page template
 */

'use client';

import React, { forwardRef, ReactNode } from 'react';
import { PageHeader } from '../page-header';
import { PageContent } from '../page-content';
import { Grid } from '../../primitives/grid';
import { Flex } from '../../primitives/flex';
import { Input } from '../../primitives/input';
import { cn } from '../../utils/cn';

export interface GridPageProps {
  /**
   * Page title
   */
  title: string;

  /**
   * Page description
   */
  description?: string;

  /**
   * Breadcrumbs
   */
  breadcrumbs?: ReactNode;

  /**
   * Actions (typically create button)
   */
  actions?: ReactNode;

  /**
   * Search placeholder
   */
  searchPlaceholder?: string;

  /**
   * Search value
   */
  searchValue?: string;

  /**
   * Search change handler
   */
  onSearchChange?: (value: string) => void;

  /**
   * Filters
   */
  filters?: ReactNode;

  /**
   * Grid items
   */
  children: ReactNode;

  /**
   * Number of columns
   */
  columns?: 1 | 2 | 3 | 4 | 6;

  /**
   * Whether data is loading
   */
  loading?: boolean;

  /**
   * Error message
   */
  error?: string | Error;

  /**
   * Retry handler
   */
  onRetry?: () => void;

  /**
   * Pagination
   */
  pagination?: ReactNode;

  /**
   * Additional class names
   */
  className?: string;
}

export const GridPage = forwardRef<HTMLDivElement, GridPageProps>(
  function GridPage(
    {
      title,
      description,
      breadcrumbs,
      actions,
      searchPlaceholder = 'Search...',
      searchValue,
      onSearchChange,
      filters,
      children,
      columns = 3,
      loading = false,
      error,
      onRetry,
      pagination,
      className,
    },
    ref
  ) {
    const columnClasses = cn(
      'grid-cols-1',
      columns >= 2 && 'sm:grid-cols-2',
      columns >= 3 && 'md:grid-cols-3',
      columns >= 4 && 'lg:grid-cols-4',
      columns >= 6 && 'xl:grid-cols-6'
    );

    return (
      <div ref={ref} className={className}>
        <PageHeader
          title={title}
          description={description}
          breadcrumbs={breadcrumbs}
          actions={actions}
        />

        <PageContent loading={loading} error={error} onRetry={onRetry} centered>
          <div className="p-6">
            <Flex direction="vertical" gap="6">
              {/* Search and Filters */}
              {(onSearchChange || filters) && (
                <Flex align="center" gap="4" wrap="wrap">
                  {onSearchChange && (
                    <div className="flex-1 min-w-[200px]">
                      <Input
                        type="search"
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                      />
                    </div>
                  )}
                  {filters && <div className="flex-shrink-0">{filters}</div>}
                </Flex>
              )}

              {/* Grid */}
              <Grid gap="6" className={columnClasses}>
                {children}
              </Grid>

              {/* Pagination */}
              {pagination && <Flex justify="center">{pagination}</Flex>}
            </Flex>
          </div>
        </PageContent>
      </div>
    );
  }
);
