/**
 * CreatePage Pattern
 * Create form page template
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

export interface CreatePageProps {
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
   * Whether form is submitting
   */
  submitting?: boolean;

  /**
   * Error message
   */
  error?: string;

  /**
   * Success message
   */
  success?: string;

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

export const CreatePage = forwardRef<HTMLDivElement, CreatePageProps>(
  function CreatePage(
    {
      title,
      description,
      breadcrumbs,
      children,
      submitting = false,
      error,
      success,
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

        <PageContent centered maxWidth="lg">
          <div className="p-6">
            <Card variant="elevated" padding="comfortable">
              <Flex direction="vertical" gap="6">
                {/* Error Message */}
                {error && (
                  <Alert variant="error" title="Error">
                    {error}
                  </Alert>
                )}

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
                      Create
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
