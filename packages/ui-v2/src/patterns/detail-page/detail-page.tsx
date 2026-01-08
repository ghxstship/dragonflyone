/**
 * DetailPage Pattern
 * Detail view page template
 */

'use client';

import React, { forwardRef, ReactNode } from 'react';
import { PageHeader } from '../page-header';
import { PageContent } from '../page-content';
import { Card } from '../../components/card';
import { cn } from '../../utils/cn';

export interface DetailPageProps {
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
   * Actions (typically edit, delete buttons)
   */
  actions?: ReactNode;

  /**
   * Main content
   */
  children: ReactNode;

  /**
   * Sidebar content
   */
  sidebar?: ReactNode;

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

export const DetailPage = forwardRef<HTMLDivElement, DetailPageProps>(
  function DetailPage(
    {
      title,
      description,
      breadcrumbs,
      actions,
      children,
      sidebar,
      loading = false,
      error,
      onRetry,
      className,
    },
    ref
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
            <div className={cn('grid gap-6', sidebar ? 'lg:grid-cols-[1fr_300px]' : 'grid-cols-1')}>
              {/* Main Content */}
              <Card variant="elevated" padding="comfortable">
                {children}
              </Card>

              {/* Sidebar */}
              {sidebar && (
                <Card variant="elevated" padding="comfortable">
                  {sidebar}
                </Card>
              )}
            </div>
          </div>
        </PageContent>
      </div>
    );
  }
);
