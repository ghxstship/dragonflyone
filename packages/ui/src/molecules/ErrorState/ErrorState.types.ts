import type { ReactNode } from "react";

/**
 * ErrorState component props
 */
export interface ErrorStateProps {
  /** Error title - defaults to "Something went wrong" */
  title?: string;
  
  /** Error description or message */
  description?: string;
  
  /** The actual error object for detailed information */
  error?: Error | null;
  
  /** Show error details (stack trace) - only in development */
  showDetails?: boolean;
  
  /** Custom icon - defaults to AlertTriangle */
  icon?: ReactNode;
  
  /** Primary retry action */
  onRetry?: () => void;
  
  /** Custom retry label */
  retryLabel?: string;
  
  /** Go back action */
  onGoBack?: () => void;
  
  /** Go home action */
  onGoHome?: () => void;
  
  /** Additional custom action */
  customAction?: ErrorStateCustomAction;
  
  /** Error severity level */
  severity?: ErrorStateSeverity;
  
  /** Inverted color scheme (for dark backgrounds) */
  inverted?: boolean;
  
  /** Full page error (centered with more padding) */
  fullPage?: boolean;
  
  /** Additional className */
  className?: string;
}

/**
 * ErrorState custom action
 */
export interface ErrorStateCustomAction {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
}

/**
 * ErrorState severity levels
 */
export type ErrorStateSeverity = 
  | "error"
  | "warning"
  | "info";
