"use client";

import { forwardRef, ReactNode } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";
import { Stack } from "../foundations/layout.js";
import { Spinner } from "../atoms/spinner.js";
import { Body, H2 } from "../atoms/typography.js";
import { Button } from "../atoms/button.js";
import { AlertTriangle, WifiOff, ShieldX } from "lucide-react";

export type PageLayoutProps = HTMLAttributes<HTMLDivElement> & {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  /** Background theme */
  background?: "white" | "black" | "ink";
  /** Dark/light theme (alias for background) */
  inverted?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Error state */
  error?: Error | null;
  /** Error retry handler */
  onRetry?: () => void;
  /** Empty state */
  empty?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state action */
  emptyAction?: { label: string; onClick: () => void };
  /** Offline state */
  offline?: boolean;
  /** Restricted/access denied state */
  restricted?: boolean;
  /** Restricted message */
  restrictedMessage?: string;
  /** Restricted action */
  restrictedAction?: { label: string; onClick: () => void };
};

/**
 * PageLayout component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Full-height layout structure
 * - Clean header/footer integration
 * - Dark-first design support
 * - Loading, error, empty, offline, restricted state variants
 * - Skip to main content accessibility link
 */
export const PageLayout = forwardRef<HTMLDivElement, PageLayoutProps>(
  function PageLayout(
    {
      header,
      footer,
      children,
      background,
      inverted = true,
      loading = false,
      loadingMessage = "Loading...",
      error = null,
      onRetry,
      empty = false,
      emptyMessage = "Nothing to display",
      emptyAction,
      offline = false,
      restricted = false,
      restrictedMessage = "You don't have permission to access this page",
      restrictedAction,
      className,
      ...props
    },
    ref
  ) {
    // Determine background class
    const bgClass = background
      ? background === "black"
        ? "bg-black text-white"
        : background === "ink"
          ? "bg-surface-inverse text-text-primary"
          : "bg-surface-primary text-text-primary"
      : inverted
        ? "bg-surface-inverse text-text-primary"
        : "bg-white text-black";

    const isDark = background === "black" || background === "ink" || inverted;

    // Loading state
    if (loading) {
      return (
        <div
          ref={ref}
          className={clsx("min-h-screen flex flex-col", bgClass, className)}
          {...props}
        >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-skip-link focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-badge focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Skip to main content
          </a>
          {header}
          <main id="main-content" className="flex-1 flex items-center justify-center p-8" tabIndex={-1}>
            <Stack gap={4} className="items-center text-center">
              <Spinner size="lg" />
              <Body className={isDark ? "text-text-muted" : "text-text-muted"}>
                {loadingMessage}
              </Body>
            </Stack>
          </main>
          {footer}
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div
          ref={ref}
          className={clsx("min-h-screen flex flex-col", bgClass, className)}
          {...props}
        >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-skip-link focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-badge focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Skip to main content
          </a>
          {header}
          <main id="main-content" className="flex-1 flex items-center justify-center p-8" tabIndex={-1}>
            <Stack gap={6} className="items-center text-center max-w-md">
              <AlertTriangle className="size-16 text-error animate-shake" />
              <Stack gap={2} className="items-center">
                <H2 className={isDark ? "text-text-primary" : "text-text-primary"}>
                  Something Went Wrong
                </H2>
                <Body className={isDark ? "text-text-muted" : "text-text-muted"}>
                  {error.message || "An unexpected error occurred"}
                </Body>
              </Stack>
              {onRetry && (
                <Button variant="solid" onClick={onRetry}>
                  Try Again
                </Button>
              )}
            </Stack>
          </main>
          {footer}
        </div>
      );
    }

    // Offline state
    if (offline) {
      return (
        <div
          ref={ref}
          className={clsx("min-h-screen flex flex-col", bgClass, className)}
          {...props}
        >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-skip-link focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-badge focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Skip to main content
          </a>
          {header}
          <main id="main-content" className="flex-1 flex items-center justify-center p-8" tabIndex={-1}>
            <Stack gap={6} className="items-center text-center max-w-md">
              <WifiOff className="size-16 text-warning" />
              <Stack gap={2} className="items-center">
                <H2 className={isDark ? "text-text-primary" : "text-text-primary"}>
                  You&apos;re Offline
                </H2>
                <Body className={isDark ? "text-text-muted" : "text-text-muted"}>
                  Please check your internet connection and try again.
                </Body>
              </Stack>
              <Button variant="solid" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </Stack>
          </main>
          {footer}
        </div>
      );
    }

    // Restricted/access denied state
    if (restricted) {
      return (
        <div
          ref={ref}
          className={clsx("min-h-screen flex flex-col", bgClass, className)}
          {...props}
        >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-skip-link focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-badge focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Skip to main content
          </a>
          {header}
          <main id="main-content" className="flex-1 flex items-center justify-center p-8" tabIndex={-1}>
            <Stack gap={6} className="items-center text-center max-w-md">
              <ShieldX className="size-16 text-error" />
              <Stack gap={2} className="items-center">
                <H2 className={isDark ? "text-text-primary" : "text-text-primary"}>
                  Access Denied
                </H2>
                <Body className={isDark ? "text-text-muted" : "text-text-muted"}>
                  {restrictedMessage}
                </Body>
              </Stack>
              {restrictedAction && (
                <Button variant="solid" onClick={restrictedAction.onClick}>
                  {restrictedAction.label}
                </Button>
              )}
            </Stack>
          </main>
          {footer}
        </div>
      );
    }

    // Empty state
    if (empty) {
      return (
        <div
          ref={ref}
          className={clsx("min-h-screen flex flex-col", bgClass, className)}
          {...props}
        >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-skip-link focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-badge focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Skip to main content
          </a>
          {header}
          <main id="main-content" className="flex-1 flex items-center justify-center p-8" tabIndex={-1}>
            <Stack gap={6} className="items-center text-center max-w-md">
              <div className={clsx(
                "size-20 rounded-full flex items-center justify-center border-2",
                isDark ? "border-border bg-surface-elevated" : "border-border bg-muted"
              )}>
                <div className={clsx(
                  "size-10 rounded-full",
                  isDark ? "bg-surface-elevated" : "bg-muted"
                )} />
              </div>
              <Body className={isDark ? "text-text-muted" : "text-text-muted"}>
                {emptyMessage}
              </Body>
              {emptyAction && (
                <Button variant="solid" onClick={emptyAction.onClick}>
                  {emptyAction.label}
                </Button>
              )}
            </Stack>
          </main>
          {footer}
        </div>
      );
    }

    // Default state
    return (
      <div
        ref={ref}
        className={clsx("min-h-screen flex flex-col", bgClass, className)}
        {...props}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-skip-link focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-badge focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Skip to main content
        </a>
        {header}
        <main id="main-content" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        {footer}
      </div>
    );
  }
);
