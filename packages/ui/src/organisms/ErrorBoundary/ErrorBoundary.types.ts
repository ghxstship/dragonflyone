import type { ReactNode } from "react";
import type { ErrorInfo } from "react";

/**
 * ErrorBoundary component props
 */
export interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  
  /** Custom fallback component */
  fallback?: ReactNode;
  
  /** Error handler callback */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  
  /** Enable Sentry integration */
  enableSentry?: boolean;
  
  /** Custom reset handler */
  onReset?: () => void;
}

/**
 * ErrorBoundary state
 */
export interface ErrorBoundaryState {
  /** Whether an error occurred */
  hasError: boolean;
  
  /** The error that occurred */
  error: Error | null;
}

/**
 * Default error fallback props
 */
export interface ErrorFallbackProps {
  /** The error that occurred */
  error: Error | null;
  
  /** Reset handler */
  onReset: () => void;
  
  /** Inverted theme */
  inverted?: boolean;
}
