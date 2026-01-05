"use client";

import React, { useState } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft, Home } from "lucide-react";
import { 
  errorStateVariants,
  errorStateIconVariants,
  errorStateTitleVariants,
  errorStateDescriptionVariants,
  errorStateDetailsVariants 
} from "./ErrorState.variants.js";
import type { ErrorStateProps } from "./ErrorState.types.js";

/**
 * ErrorState component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold dashed borders for error states (comic panel style)
 * - Clear visual hierarchy
 * - Multiple action buttons
 * - Development mode error details
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <ErrorState
 *   title="Network Error"
 *   description="Unable to connect to the server. Please check your internet connection."
 *   severity="error"
 *   onRetry={() => window.location.reload()}
 *   onGoHome={() => router.push('/')}
 * />
 * ```
 */
export function ErrorState({
  title = "Something went wrong",
  description,
  error,
  showDetails = false,
  icon,
  onRetry,
  retryLabel = "Try Again",
  onGoBack,
  onGoHome,
  customAction,
  severity = "error",
  inverted = false,
  fullPage = false,
  className,
}: ErrorStateProps) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  // Default icon based on severity
  const defaultIcon = (
    <AlertTriangle className="w-16 h-16" />
  );

  const displayIcon = icon || defaultIcon;

  return (
    <div className={errorStateVariants({ severity, fullPage, inverted, className })}>
      {/* Icon */}
      <div className={errorStateIconVariants({ severity, inverted })}>
        {displayIcon}
      </div>

      {/* Title */}
      <h2 className={errorStateTitleVariants({ inverted })}>
        {title}
      </h2>

      {/* Description */}
      {description && (
        <p className={errorStateDescriptionVariants({ inverted })}>
          {description}
        </p>
      )}

      {/* Error Details (Development Only) */}
      {process.env.NODE_ENV === 'development' && error && showDetails && (
        <details className="mt-4">
          <summary 
            className="cursor-pointer text-sm font-medium mb-2 hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              setDetailsExpanded(!detailsExpanded);
            }}
          >
            Error Details (Development Only)
          </summary>
          {detailsExpanded && (
            <div className={errorStateDetailsVariants({ inverted })}>
              <div className="font-bold mb-2">Error Message:</div>
              <div className="mb-4">{error.message}</div>
              
              <div className="font-bold mb-2">Stack Trace:</div>
              <pre className="whitespace-pre-wrap text-xs">
                {error.stack}
              </pre>
            </div>
          )}
        </details>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        {/* Retry Button */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-button font-medium transition-all duration-[var(--duration-fast)] ease-[var(--easing-easeOut)] bg-brand-primary border-brand-primary text-white hover:bg-brand-primary-hover shadow-primary"
          >
            <RefreshCw className="w-4 h-4" />
            {retryLabel}
          </button>
        )}

        {/* Go Back Button */}
        {onGoBack && (
          <button
            onClick={onGoBack}
            className="flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-button font-medium transition-all duration-[var(--duration-fast)] ease-[var(--easing-easeOut)] bg-surface-elevated border-border text-text-primary hover:bg-surface-hover"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        )}

        {/* Go Home Button */}
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-button font-medium transition-all duration-[var(--duration-fast)] ease-[var(--easing-easeOut)] bg-surface-elevated border-border text-text-primary hover:bg-surface-hover"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        )}

        {/* Custom Action */}
        {customAction && (
          <button
            onClick={customAction.onClick}
            className="flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-button font-medium transition-all duration-[var(--duration-fast)] ease-[var(--easing-easeOut)] bg-surface-elevated border-border text-text-primary hover:bg-surface-hover"
          >
            {customAction.icon && <span>{customAction.icon}</span>}
            {customAction.label}
          </button>
        )}
      </div>
    </div>
  );
}
