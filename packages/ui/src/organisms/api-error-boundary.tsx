'use client';

import React, { ReactNode } from 'react';
import { ErrorBoundary } from './error-boundary.js';
import { Button } from '../atoms/button.js';

interface ApiErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
}

export function ApiErrorBoundary({ children, onRetry }: ApiErrorBoundaryProps) {
  const handleError = (error: Error) => {
    // Check if it's an API error
    const isApiError = error.message.includes('fetch') || 
                       error.message.includes('API') ||
                       error.message.includes('network');

    if (isApiError) {
      console.error('API Error detected:', error);
    }
  };

  const fallback = (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4 border-2 border-warning-500 bg-ink-900 p-6">
        <div className="space-y-2">
          <h2 className="font-display text-h4-md text-white">
            Connection Error
          </h2>
          <p className="text-body-sm text-ink-300">
            We&apos;re having trouble connecting to our servers. Please check your internet connection and try again.
          </p>
        </div>

        <div className="flex gap-3">
          {onRetry && (
            <Button onClick={onRetry} variant="solid">
              Retry
            </Button>
          )}
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}
