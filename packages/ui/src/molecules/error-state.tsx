import { ReactNode } from "react";
import clsx from "clsx";
import { H3, Body } from "../atoms/typography.js";
import { Button } from "../atoms/button.js";
import { AlertTriangle, RefreshCw, ArrowLeft, Home } from "lucide-react";

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
  customAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  /** Error severity level */
  severity?: "error" | "warning" | "info";
  /** Inverted color scheme (for dark backgrounds) */
  inverted?: boolean;
  /** Full page error (centered with more padding) */
  fullPage?: boolean;
  /** Additional className */
  className?: string;
}

const severityStyles = {
  error: {
    border: "border-error",
    bg: "bg-error/10",
    bgInverted: "bg-error/20",
    icon: "text-error",
  },
  warning: {
    border: "border-warning",
    bg: "bg-warning/10",
    bgInverted: "bg-warning/20",
    icon: "text-warning",
  },
  info: {
    border: "border-info",
    bg: "bg-info/10",
    bgInverted: "bg-info/20",
    icon: "text-info",
  },
};

/**
 * ErrorState component - Bold Contemporary Pop Art Adventure
 * 
 * Standardized error display component for consistent error handling across apps.
 * 
 * Features:
 * - Bold 2px solid border with severity-based colors
 * - Clear visual hierarchy with icon, title, description
 * - Retry, go back, and go home actions
 * - Optional error details for development
 * - Full page mode for route-level errors
 * - Inverted mode for dark backgrounds
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
  const styles = severityStyles[severity];
  const errorMessage = error?.message || description || "An unexpected error occurred. Please try again.";
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center text-center",
        "border-2 rounded-card",
        styles.border,
        inverted ? styles.bgInverted : styles.bg,
        fullPage ? "min-h-[60vh] p-16" : "p-8 md:p-12",
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      {/* Icon */}
      <div className={clsx("mb-6", styles.icon)}>
        {icon || <AlertTriangle className="size-12" strokeWidth={2} />}
      </div>

      {/* Title */}
      <H3
        className={clsx(
          "uppercase tracking-wider",
          inverted ? "text-white" : "text-ink-900"
        )}
      >
        {title}
      </H3>

      {/* Description */}
      <Body
        className={clsx(
          "mt-4 max-w-md",
          inverted ? "text-on-dark-muted" : "text-ink-600"
        )}
      >
        {errorMessage}
      </Body>

      {/* Error Details (Development Only) */}
      {showDetails && isDev && error?.stack && (
        <div
          className={clsx(
            "mt-6 w-full max-w-2xl overflow-auto rounded-card p-4 text-left",
            "font-mono text-xs",
            inverted ? "bg-ink-900 text-on-dark-muted" : "bg-grey-100 text-on-dark-disabled"
          )}
        >
          <pre className="whitespace-pre-wrap break-words">{error.stack}</pre>
        </div>
      )}

      {/* Actions */}
      {(onRetry || onGoBack || onGoHome || customAction) && (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {onRetry && (
            <Button
              variant="solid"
              inverted={inverted}
              onClick={onRetry}
              icon={<RefreshCw className="size-4" />}
              iconPosition="left"
            >
              {retryLabel}
            </Button>
          )}
          {onGoBack && (
            <Button
              variant="outline"
              inverted={inverted}
              onClick={onGoBack}
              icon={<ArrowLeft className="size-4" />}
              iconPosition="left"
            >
              Go Back
            </Button>
          )}
          {onGoHome && (
            <Button
              variant="outline"
              inverted={inverted}
              onClick={onGoHome}
              icon={<Home className="size-4" />}
              iconPosition="left"
            >
              Go Home
            </Button>
          )}
          {customAction && (
            <Button
              variant="ghost"
              inverted={inverted}
              onClick={customAction.onClick}
              icon={customAction.icon}
              iconPosition="left"
            >
              {customAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * PageErrorState - Full page error state for route-level errors
 * Convenience wrapper around ErrorState with fullPage=true
 */
export function PageErrorState(props: Omit<ErrorStateProps, "fullPage">) {
  return <ErrorState {...props} fullPage />;
}

/**
 * InlineErrorState - Compact inline error for form fields or small areas
 */
export function InlineErrorState({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex items-center gap-3 rounded-button border-2 border-error bg-error/10 px-4 py-3",
        className
      )}
      role="alert"
    >
      <AlertTriangle className="size-5 shrink-0 text-error" />
      <Body size="sm" className="text-error">
        {message}
      </Body>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="ml-auto shrink-0"
        >
          Retry
        </Button>
      )}
    </div>
  );
}
