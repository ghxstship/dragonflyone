'use client';

import React, { Component, ErrorInfo } from 'react';
import { ErrorFallback } from './ErrorFallback.js';
import type { ErrorBoundaryProps, ErrorBoundaryState } from './ErrorBoundary.types.js';

/**
 * ErrorBoundary component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold dashed borders for error states (comic panel style)
 * - Clear visual hierarchy with error messaging
 * - Sentry integration for error tracking
 * - Development mode error details
 * - CVA-based variants for consistent theming
 * - Accessibility features
 * 
 * @example
 * ```tsx
 * <ErrorBoundary
 *   onError={(error, errorInfo) => console.error('Error:', error)}
 *   enableSentry={true}
 * >
 *   <YourApp />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to Sentry if enabled and available
    if (this.props.enableSentry !== false && typeof window !== 'undefined') {
      const sentryWindow = window as { Sentry?: { captureException: (error: Error, options?: unknown) => void } };
      if (sentryWindow.Sentry) {
        sentryWindow.Sentry.captureException(error, { 
          contexts: { 
            react: {
              componentStack: errorInfo.componentStack,
            }
          } 
        });
      }
    }

    // Log to external error tracking service (fallback)
    if (typeof window !== 'undefined') {
      const sentryWindow = window as { Sentry?: { captureException: (error: Error, options?: unknown) => void } };
      if (sentryWindow.Sentry) {
        sentryWindow.Sentry.captureException(error, { contexts: { react: errorInfo } });
      }
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    
    // Call custom reset handler
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Use default ErrorFallback
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    // Render children normally
    return this.props.children;
  }
}
