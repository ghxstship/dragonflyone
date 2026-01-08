/**
 * WidgetContainer Pattern
 * Container for dashboard widgets with header and actions
 */

import React, { forwardRef, ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/card';
import { Flex } from '../../primitives/flex';
import { Spinner } from '../../primitives/spinner';
import { Text } from '../../primitives/text';
import { cn } from '../../utils/cn';

export interface WidgetContainerProps {
  /**
   * Widget title
   */
  title: string;

  /**
   * Widget description
   */
  description?: string;

  /**
   * Actions (typically buttons or menu)
   */
  actions?: ReactNode;

  /**
   * Widget content
   */
  children: ReactNode;

  /**
   * Whether widget is loading
   */
  loading?: boolean;

  /**
   * Error message
   */
  error?: string;

  /**
   * Empty state message
   */
  emptyMessage?: string;

  /**
   * Whether widget is empty
   */
  isEmpty?: boolean;

  /**
   * Card padding
   */
  padding?: 'none' | 'compact' | 'comfortable';

  /**
   * Additional class names
   */
  className?: string;
}

export const WidgetContainer = forwardRef<HTMLDivElement, WidgetContainerProps>(
  function WidgetContainer(
    {
      title,
      description,
      actions,
      children,
      loading = false,
      error,
      emptyMessage = 'No data available',
      isEmpty = false,
      padding = 'comfortable',
      className,
    },
    ref
  ) {
    return (
      <Card ref={ref} variant="elevated" padding="none" className={className}>
        {/* Header */}
        <CardHeader className="border-b border-border-primary">
          <Flex align="center" justify="between" gap="4">
            <div className="flex-1 min-w-0">
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {actions && <div className="flex-shrink-0">{actions}</div>}
          </Flex>
        </CardHeader>

        {/* Content */}
        <CardContent className={cn(padding === 'none' ? 'p-0' : undefined)}>
          {loading ? (
            <Flex
              direction="vertical"
              align="center"
              justify="center"
              gap="2"
              className="min-h-[200px]"
            >
              <Spinner size="md" />
              <Text size="sm" className="text-text-secondary">
                Loading...
              </Text>
            </Flex>
          ) : error ? (
            <Flex
              direction="vertical"
              align="center"
              justify="center"
              className="min-h-[200px] text-feedback-error"
            >
              <Text size="sm">{error}</Text>
            </Flex>
          ) : isEmpty ? (
            <Flex
              direction="vertical"
              align="center"
              justify="center"
              className="min-h-[200px]"
            >
              <Text size="sm" className="text-text-secondary">
                {emptyMessage}
              </Text>
            </Flex>
          ) : (
            children
          )}
        </CardContent>
      </Card>
    );
  }
);
