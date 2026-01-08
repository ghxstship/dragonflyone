/**
 * PageContent Pattern
 * Page content wrapper with loading and error states
 */

'use client';

import React, { forwardRef, ReactNode } from 'react';
import { Box } from '../../primitives/box';
import { Spinner } from '../../primitives/spinner';
import { Text } from '../../primitives/text';
import { Button } from '../../primitives/button';
import { Flex } from '../../primitives/flex';
import { Alert } from '../../components/alert';
import { cn } from '../../utils/cn';

export interface PageContentProps {
  /**
   * Content children
   */
  children?: ReactNode;

  /**
   * Whether content is loading
   */
  loading?: boolean;

  /**
   * Error message
   */
  error?: string | Error;

  /**
   * Retry handler for errors
   */
  onRetry?: () => void;

  /**
   * Loading message
   */
  loadingMessage?: string;

  /**
   * Custom loading component
   */
  loadingComponent?: ReactNode;

  /**
   * Custom error component
   */
  errorComponent?: ReactNode;

  /**
   * Container width
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

  /**
   * Whether to center content
   */
  centered?: boolean;

  /**
   * Additional class names
   */
  className?: string;
}

const maxWidthStyles = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

export const PageContent = forwardRef<HTMLDivElement, PageContentProps>(
  function PageContent(
    {
      children,
      loading = false,
      error,
      onRetry,
      loadingMessage = 'Loading...',
      loadingComponent,
      errorComponent,
      maxWidth = 'full',
      centered = false,
      className,
    },
    ref
  ) {
    // Loading state
    if (loading) {
      if (loadingComponent) {
        return <>{loadingComponent}</>;
      }

      return (
        <Flex
          direction="vertical"
          align="center"
          justify="center"
          gap="3"
          className="min-h-[400px]"
        >
          <Spinner size="lg" />
          <Text size="base" className="text-text-secondary">
            {loadingMessage}
          </Text>
        </Flex>
      );
    }

    // Error state
    if (error) {
      if (errorComponent) {
        return <>{errorComponent}</>;
      }

      const errorMessage = error instanceof Error ? error.message : error;

      return (
        <div className="p-6">
          <Alert variant="error" title="Error">
            <Flex direction="vertical" gap="3">
              <Text size="base">{errorMessage}</Text>
              {onRetry && (
                <div>
                  <Button onClick={onRetry} variant="outline" size="sm">
                    Try Again
                  </Button>
                </div>
              )}
            </Flex>
          </Alert>
        </div>
      );
    }

    // Content state
    return (
      <Box
        ref={ref}
        className={cn(
          'w-full',
          maxWidthStyles[maxWidth],
          centered && 'mx-auto',
          className
        )}
      >
        {children}
      </Box>
    );
  }
);
