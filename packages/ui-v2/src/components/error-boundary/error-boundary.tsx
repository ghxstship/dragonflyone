/**
 * ErrorBoundary Component
 * Catches and handles React errors
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box } from '../../primitives/box';
import { Heading } from '../../primitives/heading';
import { Text } from '../../primitives/text';
import { Button } from '../../primitives/button';
import { Flex } from '../../primitives/flex';
import { cn } from '../../utils/cn';

export interface ErrorBoundaryProps {
  /**
   * Children to render
   */
  children: ReactNode;

  /**
   * Custom fallback UI
   */
  fallback?: (error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode;

  /**
   * Error handler callback
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;

  /**
   * Whether to show error details
   */
  showDetails?: boolean;

  /**
   * Additional class names
   */
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      errorInfo,
    });

    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails = false, className } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, errorInfo!, this.resetError);
      }

      // Default error UI
      return (
        <Box
          className={cn(
            'p-8 rounded-lg bg-feedback-error-bg border border-feedback-error',
            className
          )}
        >
          <Flex direction="vertical" gap="4" align="start">
            {/* Error Icon */}
            <div className="w-12 h-12 rounded-full bg-feedback-error flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Error Message */}
            <div>
              <Heading level="2" size="xl" className="text-feedback-error mb-2">
                Something went wrong
              </Heading>
              <Text size="base" className="text-text-secondary">
                An unexpected error occurred. Please try again or contact support if the
                problem persists.
              </Text>
            </div>

            {/* Error Details */}
            {showDetails && (
              <Box className="w-full p-4 bg-surface-elevated rounded-md border border-border-primary">
                <Text
                  as="pre"
                  size="sm"
                  className="text-text-secondary font-mono whitespace-pre-wrap overflow-x-auto"
                >
                  {error.toString()}
                  {errorInfo && `\n\nComponent Stack:${errorInfo.componentStack}`}
                </Text>
              </Box>
            )}

            {/* Actions */}
            <Flex gap="2">
              <Button onClick={this.resetError} variant="primary">
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Reload Page
              </Button>
            </Flex>
          </Flex>
        </Box>
      );
    }

    return children;
  }
}
