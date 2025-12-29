"use client";

import { forwardRef, ReactNode } from "react";
import clsx from "clsx";
import { Container } from "../foundations/layout.js";
import { Stack } from "../foundations/layout.js";
import { FullBleedSection } from "../foundations/page-regions.js";
import { Spinner } from "../atoms/spinner.js";
import { Body, H2 } from "../atoms/typography.js";
import { Button } from "../atoms/button.js";
import { AlertTriangle, WifiOff, ArrowRight } from "lucide-react";

// =============================================================================
// MARKETING PAGE TEMPLATE - 2026 Landing Page Best Practices
// Full-width marketing/landing page layout with sections
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

export interface MarketingSection {
  id: string;
  background?: "white" | "grey" | "ink" | "black" | "primary" | "accent" | "gradient";
  pattern?: "none" | "grid" | "halftone" | "stripes";
  patternOpacity?: number;
  className?: string;
  content: ReactNode;
  /** Full height section (for hero) */
  fullHeight?: boolean;
}

export interface MarketingPageProps {
  /** Page sections */
  sections: MarketingSection[];
  /** Header component (navigation) */
  header?: ReactNode;
  /** Footer component */
  footer?: ReactNode;
  /** Dark/light base theme */
  inverted?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Error state */
  error?: Error | null;
  /** Error retry handler */
  onRetry?: () => void;
  /** Offline state */
  offline?: boolean;
  /** Skip to main content label */
  skipToMainLabel?: string;
  /** Main content id for skip link */
  mainContentId?: string;
  /** Sticky CTA bar at bottom */
  stickyCta?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  /** Custom className */
  className?: string;
}

/**
 * MarketingPage - Full-width marketing/landing page template
 * 
 * Features:
 * - Multiple full-bleed sections with different backgrounds
 * - Pattern background support (grid, halftone, stripes)
 * - Header/footer slots for navigation
 * - Loading, error, offline state variants
 * - Skip to main content accessibility link
 * - Responsive design
 * - Dark-first design
 * 
 * Use cases:
 * - Product landing pages
 * - Marketing pages
 * - Membership/pricing pages
 * - Feature showcase pages
 * - Home pages
 */
export const MarketingPage = forwardRef<HTMLDivElement, MarketingPageProps>(
  function MarketingPage(
    {
      sections,
      header,
      footer,
      inverted = true,
      loading = false,
      loadingMessage = "Loading...",
      error = null,
      onRetry,
      offline = false,
      skipToMainLabel = "Skip to main content",
      mainContentId = "main-content",
      stickyCta,
      className,
    },
    ref
  ) {
    const bgClass = inverted ? "bg-ink-950 text-white" : "bg-white text-ink-900";

    // Render state content
    const renderStateContent = (
      icon: ReactNode,
      title: string,
      message: string,
      action?: ReactNode
    ) => (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Stack gap={6} className="items-center text-center max-w-md">
          {icon}
          <Stack gap={2} className="items-center">
            <H2 className={inverted ? "text-white" : "text-ink-900"}>{title}</H2>
            <Body className={inverted ? "text-grey-400" : "text-grey-600"}>{message}</Body>
          </Stack>
          {action}
        </Stack>
      </div>
    );

    // Loading state
    if (loading) {
      return (
        <div ref={ref} className={clsx("min-h-screen flex flex-col", bgClass, className)}>
          {header}
          {renderStateContent(
            <Spinner size="lg" />,
            "Loading",
            loadingMessage
          )}
          {footer}
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div ref={ref} className={clsx("min-h-screen flex flex-col", bgClass, className)}>
          {header}
          {renderStateContent(
            <AlertTriangle className="size-16 text-error animate-shake" />,
            "Something Went Wrong",
            error.message || "An unexpected error occurred",
            onRetry && (
              <Button variant="solid" onClick={onRetry}>
                Try Again
              </Button>
            )
          )}
          {footer}
        </div>
      );
    }

    // Offline state
    if (offline) {
      return (
        <div ref={ref} className={clsx("min-h-screen flex flex-col", bgClass, className)}>
          {header}
          {renderStateContent(
            <WifiOff className="size-16 text-warning" />,
            "You're Offline",
            "Please check your internet connection and try again.",
            <Button variant="solid" onClick={() => window.location.reload()}>
              Retry
            </Button>
          )}
          {footer}
        </div>
      );
    }

    return (
      <div ref={ref} className={clsx("min-h-screen flex flex-col", bgClass, className)}>
        {/* Skip to main content link */}
        <a
          href={`#${mainContentId}`}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-skip-link focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-badge focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {skipToMainLabel}
        </a>

        {/* Header */}
        {header}

        {/* Main Content */}
        <main id={mainContentId} tabIndex={-1} role="main" aria-label="Page content" className="flex-1">
          {sections.map((section) => (
            <FullBleedSection
              key={section.id}
              id={section.id}
              background={section.background || (inverted ? "ink" : "white")}
              pattern={section.pattern || "none"}
              patternOpacity={section.patternOpacity}
              fullHeight={section.fullHeight}
              className={section.className}
            >
              {section.content}
            </FullBleedSection>
          ))}
        </main>

        {/* Footer */}
        {footer}

        {/* Sticky CTA Bar */}
        {stickyCta && (
          <div className="fixed bottom-0 left-0 right-0 z-sticky bg-gradient-to-t from-black via-black/95 to-transparent py-4 px-4 md:hidden">
            <Container size="sm">
              <Button
                variant="solid"
                size="lg"
                className="w-full shadow-primary"
                onClick={stickyCta.onClick}
                icon={<ArrowRight className="size-5" />}
                iconPosition="right"
              >
                {stickyCta.label}
              </Button>
            </Container>
          </div>
        )}
      </div>
    );
  }
);

export default MarketingPage;
