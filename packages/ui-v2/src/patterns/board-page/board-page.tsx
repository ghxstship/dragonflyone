/**
 * BoardPage Pattern
 * Kanban board page template
 */

'use client';

import React, { forwardRef, ReactNode } from 'react';
import { PageHeader } from '../page-header';
import { PageContent } from '../page-content';
import { Flex } from '../../primitives/flex';
import { cn } from '../../utils/cn';

export interface BoardPageProps {
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
   * Actions
   */
  actions?: ReactNode;

  /**
   * Board columns (children)
   */
  children: ReactNode;

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
   * Additional class names
   */
  className?: string;
}

export const BoardPage = forwardRef<HTMLDivElement, BoardPageProps>(
  function BoardPage(
    {
      title,
      description,
      breadcrumbs,
      actions,
      children,
      loading = false,
      error,
      onRetry,
      className,
    },
    ref
  ) {
    return (
      <div ref={ref} className={cn('flex flex-col h-full', className)}>
        <PageHeader
          title={title}
          description={description}
          breadcrumbs={breadcrumbs}
          actions={actions}
        />

        <PageContent
          loading={loading}
          error={error}
          onRetry={onRetry}
          className="flex-1 overflow-hidden"
        >
          <div className="h-full overflow-x-auto p-6">
            <Flex gap="4" className="h-full">
              {children}
            </Flex>
          </div>
        </PageContent>
      </div>
    );
  }
);
