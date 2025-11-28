'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '../atoms/button.js';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen flex-col bg-ink-950">
          {/* Navigation header to prevent white gap */}
          <header className="flex h-16 items-center justify-between border-b border-ink-800 bg-ink-950 px-spacing-6">
            <span className="font-display text-display-md text-white">ERROR</span>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outlineWhite"
              size="sm"
            >
              HOME
            </Button>
          </header>

          {/* Error content */}
          <div className="flex flex-1 items-center justify-center p-spacing-6">
            <div className="w-full max-w-md space-y-spacing-6 border-2 border-error-500 bg-ink-900 p-spacing-8">
              <div className="space-y-spacing-2">
                <h1 className="font-display text-h2-md text-white">
                  Something went wrong
                </h1>
                <p className="text-ink-300">
                  An unexpected error occurred. We&apos;ve been notified and are working on a fix.
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="space-y-spacing-2">
                  <p className="font-mono text-mono-xs uppercase tracking-widest text-error-400">
                    Error Details
                  </p>
                  <div className="max-h-spacing-48 overflow-auto border border-ink-700 bg-ink-950 p-spacing-4">
                    <pre className="font-mono text-mono-xs text-error-400">
                      {this.state.error.message}
                    </pre>
                    {this.state.error.stack && (
                      <pre className="mt-spacing-2 font-mono text-mono-xs text-ink-500">
                        {this.state.error.stack}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-gap-md">
                <Button onClick={this.handleReset} variant="solid">
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                >
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
