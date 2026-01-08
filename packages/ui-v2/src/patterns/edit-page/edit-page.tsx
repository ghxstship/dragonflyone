/**
 * EditPage Pattern
 * Edit form page template
 */

'use client';

import React, { forwardRef, ReactNode } from 'react';
import { PageHeader } from '../page-header';
import { PageContent } from '../page-content';
import { Card } from '../../components/card';
import { Button } from '../../primitives/button';
import { Flex } from '../../primitives/flex';
import { Alert } from '../../components/alert';
import { cn } from '../../utils/cn';

export interface EditPageProps {
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
   * Form content (children)
   */
  children: ReactNode;

  /**
   * Whether data is loading
   */
  loading?: boolean;

  /**
   * Whether form is submitting
   */
  submitting?: boolean;

  /**
   * Error message
   */
  error?: string | Error;

  /**
   * Success message
   */
  success?: string;

  /**
   * Retry handler
   */
  onRetry?: () => void;

  /**
   * Cancel handler
   */
  onCancel?: () => void;

  /**
   * Submit handler
   */
  onSubmit?: () => void;

  /**
   * Additional footer actions
   */
  footerActions?: ReactNode;

  /**
   * Additional class names
   */
  className?: string;
}

export const EditPage = forwardRef<HTMLDivElement, EditPageProps>(
  function EditPage(
    {
      title,
      description,
      breadcrumbs,
      children,
      loading = false,
      submitting = false,
      error,
      success,
      onRetry,
      onCancel,
      onSubmit,
      footerActions,
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
        />

        <PageContent loading={loading} error={error} onRetry={onRetry} centered maxWidth="lg">
          <div className="p-6">
            <Card variant="elevated" padding="comfortable">
              <Flex direction="vertical" gap="6">
                {/* Success Message */}
                {success && (
                  <Alert variant="success" title="Success">
                    {success}
                  </Alert>
                )}

                {/* Form Content */}
                <div>{children}</div>

                {/* Footer Actions */}
                <Flex gap="3" justify="end" className="pt-4 border-t border-border-primary">
                  {onCancel && (
                    <Button
                      variant="outline"
                      onClick={onCancel}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                  )}
                  {footerActions}
                  {onSubmit && (
                    <Button
                      variant="primary"
                      onClick={onSubmit}
                      loading={submitting}
                    >
                      Save Changes
                    </Button>
                  )}
                </Flex>
              </Flex>
            </Card>
          </div>
        </PageContent>
      </div>
    );
  }
);
