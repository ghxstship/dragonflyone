/**
 * ListPage Pattern
 * Complete list/table page template
 */

'use client';

import React, { forwardRef, ReactNode } from 'react';
import { PageHeader } from '../page-header';
import { PageContent } from '../page-content';
import { Table, TableColumn } from '../../components/table';
import { Flex } from '../../primitives/flex';
import { Input } from '../../primitives/input';
import { cn } from '../../utils/cn';

export interface ListPageProps<T = any> {
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
   * Table columns
   */
  columns: TableColumn<T>[];

  /**
   * Table data
   */
  data: T[];

  /**
   * Row key accessor
   */
  rowKey?: string | ((row: T) => string);

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
   * Row click handler
   */
  onRowClick?: (row: T, index: number) => void;

  /**
   * Pagination
   */
  pagination?: ReactNode;

  /**
   * Additional class names
   */
  className?: string;
}

export const ListPage = forwardRef(function ListPage<T = any>(
  {
    title,
    description,
    breadcrumbs,
    actions,
    searchPlaceholder = 'Search...',
    searchValue,
    onSearchChange,
    filters,
    columns,
    data,
    rowKey,
    loading = false,
    error,
    onRetry,
    onRowClick,
    pagination,
    className,
  }: ListPageProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
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
          <Flex direction="vertical" gap="4">
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

            {/* Table */}
            <Table
              columns={columns}
              data={data}
              rowKey={rowKey}
              onRowClick={onRowClick}
              hoverable
            />

            {/* Pagination */}
            {pagination && <Flex justify="center">{pagination}</Flex>}
          </Flex>
        </div>
      </PageContent>
    </div>
  );
}) as <T = any>(
  props: ListPageProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement | null;
