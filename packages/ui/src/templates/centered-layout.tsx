"use client";

import { forwardRef, ReactNode } from "react";
import clsx from "clsx";
import { Container, Stack } from "../foundations/layout.js";
import { FullBleedSection } from "../foundations/page-regions.js";
import { Card } from "../molecules/card.js";
import { Spinner } from "../atoms/spinner.js";
import { Body, H2 } from "../atoms/typography.js";
import { Button } from "../atoms/button.js";
import { AlertTriangle } from "lucide-react";

// =============================================================================
// CENTERED LAYOUT
// Single focal point, horizontally (and optionally vertically) centered.
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

export interface CenteredLayoutProps {
  children: ReactNode;
  /** Vertical alignment */
  align?: "vertical-center" | "top-aligned";
  /** Container style */
  container?: "card" | "none";
  /** Background style */
  background?: "none" | "full-bleed" | "split" | "pattern";
  /** Content width */
  width?: "narrow" | "medium" | "wide";
  /** Background pattern type (when background="pattern") */
  pattern?: "grid" | "halftone" | "none";
  /** Pattern opacity */
  patternOpacity?: number;
  /** Dark/light theme */
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
  /** Custom className */
  className?: string;
  /** Header content (logo, etc.) */
  header?: ReactNode;
  /** Footer content (links, copyright) */
  footer?: ReactNode;
}

const widthClasses = {
  narrow: "max-w-sm",
  medium: "max-w-md",
  wide: "max-w-2xl",
};

/**
 * CenteredLayout - Single focal point layout
 * 
 * Use cases:
 * - Auth pages (login, register, forgot password, verify)
 * - Empty states
 * - Error pages (404, 500, permission denied)
 * - Maintenance/offline pages
 * - Single-action confirmations
 * 
 * Features:
 * - Vertical centering option
 * - Card container option
 * - Full-bleed/split background options
 * - Loading, error, empty state variants
 * - Responsive design
 * - Accessibility compliant
 */
export const CenteredLayout = forwardRef<HTMLDivElement, CenteredLayoutProps>(
  function CenteredLayout(
    {
      children,
      align = "vertical-center",
      container = "none",
      background = "none",
      width = "medium",
      pattern = "grid",
      patternOpacity = 0.03,
      inverted = true,
      loading = false,
      loadingMessage = "Loading...",
      error = null,
      onRetry,
      empty = false,
      emptyMessage = "Nothing to display",
      emptyAction,
      className,
      header,
      footer,
    },
    ref
  ) {
    const bgClass = inverted ? "bg-surface-inverse text-on-dark-primary" : "bg-surface-primary text-on-light-primary";
    
    // Loading state
    if (loading) {
      return (
        <div
          ref={ref}
          className={clsx(
            "min-h-screen flex flex-col",
            bgClass,
            className
          )}
        >
          {header && (
            <header className={clsx(
              "sticky top-0 z-modal border-b-2 backdrop-blur",
              inverted ? "border-border bg-surface-inverse/90" : "border-border bg-surface-primary/90"
            )}>
              {header}
            </header>
          )}
          <div className="flex-1 flex items-center justify-center p-4">
            <Stack gap={4} className="items-center text-center">
              <Spinner size="lg" />
              <Body className={inverted ? "text-on-dark-muted" : "text-on-light-muted"}>
                {loadingMessage}
              </Body>
            </Stack>
          </div>
          {footer}
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div
          ref={ref}
          className={clsx(
            "min-h-screen flex flex-col",
            bgClass,
            className
          )}
        >
          {header && (
            <header className={clsx(
              "sticky top-0 z-modal border-b-2 backdrop-blur",
              inverted ? "border-border bg-surface-inverse/90" : "border-border bg-surface-primary/90"
            )}>
              {header}
            </header>
          )}
          <div className="flex-1 flex items-center justify-center p-4">
            <Stack gap={6} className={clsx("items-center text-center", widthClasses[width])}>
              <AlertTriangle className="size-16 text-error animate-shake" />
              <Stack gap={2} className="items-center">
                <H2 className={inverted ? "text-on-dark-primary" : "text-on-light-primary"}>
                  Something Went Wrong
                </H2>
                <Body className={inverted ? "text-on-dark-muted" : "text-on-light-muted"}>
                  {error.message || "An unexpected error occurred"}
                </Body>
              </Stack>
              {onRetry && (
                <Button variant="solid" onClick={onRetry}>
                  Try Again
                </Button>
              )}
            </Stack>
          </div>
          {footer}
        </div>
      );
    }

    // Empty state
    if (empty) {
      return (
        <div
          ref={ref}
          className={clsx(
            "min-h-screen flex flex-col",
            bgClass,
            className
          )}
        >
          {header && (
            <header className={clsx(
              "sticky top-0 z-modal border-b-2 backdrop-blur",
              inverted ? "border-border bg-surface-inverse/90" : "border-border bg-surface-primary/90"
            )}>
              {header}
            </header>
          )}
          <div className="flex-1 flex items-center justify-center p-4">
            <Stack gap={6} className={clsx("items-center text-center", widthClasses[width])}>
              <div className={clsx(
                "size-20 rounded-full flex items-center justify-center border-2",
                inverted ? "border-border bg-surface-elevated" : "border-border bg-muted"
              )}>
                <div className={clsx(
                  "size-10 rounded-full",
                  inverted ? "bg-surface-elevated" : "bg-muted"
                )} />
              </div>
              <Body className={inverted ? "text-on-dark-muted" : "text-on-light-muted"}>
                {emptyMessage}
              </Body>
              {emptyAction && (
                <Button variant="solid" onClick={emptyAction.onClick}>
                  {emptyAction.label}
                </Button>
              )}
            </Stack>
          </div>
          {footer}
        </div>
      );
    }

    // Main content
    const contentElement = container === "card" ? (
      <Card inverted={inverted} className="p-6 md:p-8">
        {children}
      </Card>
    ) : (
      children
    );

    // Background rendering
    if (background === "full-bleed" || background === "pattern") {
      return (
        <div
          ref={ref}
          className={clsx("min-h-screen flex flex-col", className)}
        >
          {header && (
            <header className={clsx(
              "sticky top-0 z-modal border-b-2 backdrop-blur",
              inverted ? "border-border bg-surface-inverse/90" : "border-border bg-surface-primary/90"
            )}>
              {header}
            </header>
          )}
          <FullBleedSection
            background={inverted ? "ink" : "grey"}
            pattern={pattern}
            patternOpacity={patternOpacity}
            className={clsx(
              "flex-1 flex",
              align === "vertical-center" ? "items-center" : "pt-12 md:pt-16",
              "justify-center px-4 py-8"
            )}
          >
            <Container className={clsx("w-full", widthClasses[width])}>
              {contentElement}
            </Container>
          </FullBleedSection>
          {footer}
        </div>
      );
    }

    if (background === "split") {
      return (
        <div
          ref={ref}
          className={clsx("min-h-screen flex flex-col lg:flex-row", className)}
        >
          {/* Left panel - branding */}
          <div className={clsx(
            "hidden lg:flex lg:w-1/2 items-center justify-center p-8",
            inverted ? "bg-primary" : "bg-primary"
          )}>
            <div className="text-white text-center">
              {header || (
                <H2 className="text-white">Welcome</H2>
              )}
            </div>
          </div>
          {/* Right panel - content */}
          <div className={clsx(
            "flex-1 flex flex-col",
            bgClass
          )}>
            <div className={clsx(
              "flex-1 flex",
              align === "vertical-center" ? "items-center" : "pt-12 md:pt-16",
              "justify-center px-4 py-8"
            )}>
              <div className={clsx("w-full", widthClasses[width])}>
                {contentElement}
              </div>
            </div>
            {footer}
          </div>
        </div>
      );
    }

    // Default (no special background)
    return (
      <div
        ref={ref}
        className={clsx(
          "min-h-screen flex flex-col",
          bgClass,
          className
        )}
      >
        {header && (
          <header className={clsx(
            "sticky top-0 z-modal border-b-2 backdrop-blur",
            inverted ? "border-border bg-surface-inverse/90" : "border-border bg-surface-primary/90"
          )}>
            {header}
          </header>
        )}
        <div className={clsx(
          "flex-1 flex",
          align === "vertical-center" ? "items-center" : "pt-12 md:pt-16",
          "justify-center px-4 py-8"
        )}>
          <div className={clsx("w-full", widthClasses[width])}>
            {contentElement}
          </div>
        </div>
        {footer}
      </div>
    );
  }
);

export default CenteredLayout;
