"use client";

import { useEffect, ReactNode, forwardRef } from "react";
import clsx from "clsx";
import { AlertTriangle, RefreshCw, Home, LayoutDashboard, Copy, Check } from "lucide-react";
import { Stack, Container, Section } from "../foundations/layout.js";
import { H1, Body, Label } from "../atoms/typography.js";
import { Button } from "../atoms/button.js";
import { Alert } from "../molecules/alert.js";
import { useState } from "react";

// =============================================================================
// ERROR PAGE TEMPLATE
// Error display with recovery actions
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

export interface ErrorContentProps {
  /** Error object */
  error: Error & { digest?: string };
  /** Reset/retry handler */
  reset: () => void;
  /** App name for console logging */
  appName?: string;
  /** Show dashboard button */
  showDashboard?: boolean;
  /** Dashboard path */
  dashboardPath?: string;
  /** Home path (defaults to /) */
  homePath?: string;
  /** Home button label */
  homeLabel?: string;
  /** Dark/light theme */
  inverted?: boolean;
  /** Show error details */
  showDetails?: boolean;
  /** Custom error title */
  title?: string;
  /** Custom error description */
  description?: string;
  /** Custom actions */
  actions?: ReactNode;
  /** Support email */
  supportEmail?: string;
  /** Support URL */
  supportUrl?: string;
}

/**
 * ErrorContent - Content-only error component for use inside app layouts
 * 
 * Features:
 * - Bold error display with icon
 * - Clear action buttons (retry, home, dashboard)
 * - Error ID display with copy functionality
 * - Support contact options
 * - Dark-first design
 * 
 * Use cases:
 * - Error boundaries
 * - API error states
 * - Form submission errors
 * - Any recoverable error state
 */
export function ErrorContent({
  error,
  reset,
  appName = "GHXSTSHIP",
  showDashboard = true,
  dashboardPath = "/dashboard",
  homePath = "/",
  homeLabel = "Go Home",
  inverted = true,
  showDetails = true,
  title = "Something Went Wrong",
  description = "We encountered an unexpected error. Please try again or contact support if the issue persists.",
  actions,
  supportEmail,
  supportUrl,
}: ErrorContentProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.error(`${appName} Error:`, error);
  }, [error, appName]);

  const handleCopyErrorId = async () => {
    if (error.digest) {
      await navigator.clipboard.writeText(error.digest);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const textClass = inverted ? "text-on-dark-primary" : "text-on-light-primary";
  const mutedTextClass = inverted ? "text-on-dark-muted" : "text-on-light-muted";

  return (
    <Stack gap={8} className="mx-auto max-w-2xl min-h-[60vh] flex flex-col justify-center py-8">
      {/* Error Icon */}
      <div className="text-center">
        <div className={clsx(
          "inline-flex items-center justify-center size-24 rounded-full",
          inverted ? "bg-error/10" : "bg-error/5"
        )}>
          <AlertTriangle className="size-12 animate-shake text-error" />
        </div>
      </div>

      {/* Error Message */}
      <Stack gap={4} className="text-center">
        <H1 className={clsx(textClass, "uppercase tracking-wider")}>{title}</H1>
        <Body className={mutedTextClass}>{description}</Body>
      </Stack>

      {/* Error Details */}
      {showDetails && (
        <Alert variant="error" className="text-left">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Label size="sm" className="text-error font-semibold mb-1">Error Message</Label>
              <Body className="text-error/80 break-words">
                {error.message || "An unexpected error occurred"}
              </Body>
            </div>
          </div>
        </Alert>
      )}

      {/* Error ID */}
      {error.digest && (
        <div className={clsx(
          "flex items-center justify-center gap-2 px-4 py-2 rounded-badge mx-auto",
          inverted ? "bg-surface-elevated" : "bg-muted"
        )}>
          <Label size="xs" className={mutedTextClass}>Error ID:</Label>
          <code className={clsx("font-mono text-xs", mutedTextClass)}>{error.digest}</code>
          <button
            onClick={handleCopyErrorId}
            className={clsx(
              "p-1 rounded transition-colors",
              inverted ? "hover:bg-surface-elevated" : "hover:bg-muted"
            )}
            aria-label="Copy error ID"
          >
            {copied ? (
              <Check className="size-3.5 text-success" />
            ) : (
              <Copy className={clsx("size-3.5", mutedTextClass)} />
            )}
          </button>
        </div>
      )}

      {/* Actions */}
      {actions || (
        <Stack gap={4} direction="horizontal" className="justify-center flex-wrap">
          <Button variant="solid" onClick={reset}>
            <RefreshCw className="size-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" inverted={inverted} onClick={() => window.location.href = homePath}>
            <Home className="size-4 mr-2" />
            {homeLabel}
          </Button>
          {showDashboard && (
            <Button variant="ghost" inverted={inverted} onClick={() => window.location.href = dashboardPath}>
              <LayoutDashboard className="size-4 mr-2" />
              Dashboard
            </Button>
          )}
        </Stack>
      )}

      {/* Support Contact */}
      {(supportEmail || supportUrl) && (
        <div className="text-center">
          <Body size="sm" className={mutedTextClass}>
            Need help?{" "}
            {supportEmail && (
              <a
                href={`mailto:${supportEmail}?subject=Error Report${error.digest ? ` - ${error.digest}` : ""}`}
                className="text-primary hover:underline"
              >
                Contact Support
              </a>
            )}
            {supportEmail && supportUrl && " or "}
            {supportUrl && (
              <a href={supportUrl} className="text-primary hover:underline">
                Visit Help Center
              </a>
            )}
          </Body>
        </div>
      )}
    </Stack>
  );
}

export interface ErrorPageProps {
  /** Error object */
  error: Error & { digest?: string };
  /** Reset/retry handler */
  reset: () => void;
  /** Navigation component to render at top */
  navigation?: ReactNode;
  /** App name for console logging */
  appName?: string;
  /** Background color */
  background?: "ink" | "black" | "white";
  /** Dark/light theme */
  inverted?: boolean;
  /** Show dashboard button */
  showDashboard?: boolean;
  /** Dashboard path */
  dashboardPath?: string;
  /** Home path */
  homePath?: string;
  /** Show error details */
  showDetails?: boolean;
  /** Custom error title */
  title?: string;
  /** Custom error description */
  description?: string;
  /** Support email */
  supportEmail?: string;
  /** Support URL */
  supportUrl?: string;
  /** Skip to main content label */
  skipToMainLabel?: string;
  /** Main content id */
  mainContentId?: string;
}

/**
 * ErrorPage - Full page error template
 * 
 * Features:
 * - Bold error display with icon
 * - Clear action buttons (retry, home, dashboard)
 * - Error ID display with copy functionality
 * - Support contact options
 * - Skip to main content accessibility link
 * - Dark-first design
 * 
 * Use cases:
 * - Next.js error.tsx pages
 * - Root error boundaries
 * - Fatal application errors
 */
export const ErrorPage = forwardRef<HTMLDivElement, ErrorPageProps>(
  function ErrorPage(
    {
      error,
      reset,
      navigation,
      appName = "GHXSTSHIP",
      background = "ink",
      inverted = true,
      showDashboard = true,
      dashboardPath = "/dashboard",
      homePath = "/",
      showDetails = true,
      title,
      description,
      supportEmail,
      supportUrl,
      skipToMainLabel = "Skip to main content",
      mainContentId = "main-content",
    },
    ref
  ) {
    const bgClass = background === "ink"
      ? "bg-surface-inverse"
      : background === "black"
        ? "bg-black"
        : "bg-white";
    const isDark = background !== "white" || inverted;

    return (
      <Section
        ref={ref}
        className={clsx("relative min-h-screen overflow-hidden", bgClass, isDark ? "text-on-dark-primary" : "text-on-light-primary")}
        noPadding
      >
        {/* Skip to main content link */}
        <a
          href={`#${mainContentId}`}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-skip-link focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-badge focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {skipToMainLabel}
        </a>

        {/* Grid pattern background */}
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-10" aria-hidden="true" />

        {navigation}

        <main id={mainContentId} tabIndex={-1} role="main" aria-label="Error content">
          <Container className="py-16">
            <ErrorContent
              error={error}
              reset={reset}
              appName={appName}
              showDashboard={showDashboard}
              dashboardPath={dashboardPath}
              homePath={homePath}
              inverted={isDark}
              showDetails={showDetails}
              title={title}
              description={description}
              supportEmail={supportEmail}
              supportUrl={supportUrl}
            />
          </Container>
        </main>
      </Section>
    );
  }
);

export default ErrorPage;
