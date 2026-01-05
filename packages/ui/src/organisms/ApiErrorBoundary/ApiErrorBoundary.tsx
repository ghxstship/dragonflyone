"use client";

import React from 'react';
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary.js';
import { Button } from '../../atoms/Button/index.js';
import { apiErrorBoundaryVariants } from './ApiErrorBoundary.variants.js';
import type { ApiErrorBoundaryProps } from './ApiErrorBoundary.types.js';

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
    <div className={apiErrorBoundaryVariants()}>
      <div className="w-full max-w-md space-y-spacing-4 border-2 border-warning-500 bg-surface-elevated p-spacing-6">
        <div className="space-y-spacing-2">
          <h2 className="font-display text-h4-md text-white">
            Connection Error
          </h2>
          <p className="text-body-sm text-text-secondary">
            We&apos;re having trouble connecting to our servers. Please check your internet connection and try again.
          </p>
        </div>

        <div className="flex gap-gap-sm">
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

export default ApiErrorBoundary;
