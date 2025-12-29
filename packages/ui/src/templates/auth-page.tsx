"use client";

import { forwardRef, ReactNode } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";
import { Container, Stack } from "../foundations/layout.js";
import { FullBleedSection } from "../foundations/page-regions.js";
import { Label, Body, H2 } from "../atoms/typography.js";
import { Spinner } from "../atoms/spinner.js";
import { Button } from "../atoms/button.js";
import { AlertTriangle, WifiOff } from "lucide-react";

// =============================================================================
// AUTH PAGE TEMPLATE
// Authentication page layout with header, content, and footer
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

export interface AuthPageProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** App name displayed in header (used for default header) */
  appName?: string;
  /** Link destination for app logo */
  appHref?: string;
  /** Header action (e.g., Sign Up button) - used with default header */
  headerAction?: ReactNode;
  /** Custom header component - replaces default header when provided */
  header?: ReactNode;
  /** Main content */
  children: ReactNode;
  /** Footer links */
  footerLinks?: Array<{ label: string; href: string }>;
  /** Background theme */
  background?: "white" | "black" | "ink";
  /** Dark/light theme (alias for background) */
  inverted?: boolean;
  /** Copyright text */
  copyright?: string;
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
  /** Content max width */
  contentMaxWidth?: "sm" | "md" | "lg";
  /** Show pattern background */
  showPattern?: boolean;
  /** Pattern type */
  patternType?: "grid" | "halftone" | "none";
}

const contentMaxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

/**
 * AuthPage - Authentication page template
 * 
 * Features:
 * - Consistent header with app branding
 * - Centered content area with pattern background
 * - Footer with legal links
 * - Loading, error, offline state variants
 * - Skip to main content accessibility link
 * - Responsive design
 * - Dark-first design
 * 
 * Use cases:
 * - Sign in pages
 * - Sign up pages
 * - Password reset pages
 * - Email verification pages
 * - Two-factor authentication pages
 */
export const AuthPage = forwardRef<HTMLDivElement, AuthPageProps>(
  function AuthPage(
    {
      appName,
      appHref = "/",
      headerAction,
      header,
      children,
      footerLinks = [
        { label: "Privacy", href: "/legal/privacy" },
        { label: "Terms", href: "/legal/terms" },
        { label: "Help", href: "/help" },
      ],
      background,
      inverted = true,
      copyright = `© ${new Date().getFullYear()} GHXSTSHIP INDUSTRIES`,
      loading = false,
      loadingMessage = "Loading...",
      error = null,
      onRetry,
      offline = false,
      skipToMainLabel = "Skip to main content",
      mainContentId = "main-content",
      contentMaxWidth = "md",
      showPattern = true,
      patternType = "grid",
      className,
      ...props
    },
    ref
  ) {
    // Determine dark mode
    const isDark = background === "black" || background === "ink" || inverted;
    const bgClass = background
      ? background === "black"
        ? "bg-black text-white"
        : background === "ink"
          ? "bg-ink-950 text-white"
          : "bg-white text-black"
      : isDark
        ? "bg-ink-950 text-white"
        : "bg-white text-black";

    // Render state content
    const renderStateContent = (
      icon: ReactNode,
      title: string,
      message: string,
      action?: ReactNode
    ) => (
      <Stack gap={6} className="items-center text-center">
        {icon}
        <Stack gap={2} className="items-center">
          <H2 className={isDark ? "text-white" : "text-ink-900"}>{title}</H2>
          <Body className={isDark ? "text-grey-400" : "text-grey-600"}>{message}</Body>
        </Stack>
        {action}
      </Stack>
    );

    // Determine main content
    let mainContent: ReactNode;

    if (loading) {
      mainContent = renderStateContent(
        <Spinner size="lg" />,
        "Loading",
        loadingMessage
      );
    } else if (error) {
      mainContent = renderStateContent(
        <AlertTriangle className="size-16 text-error animate-shake" />,
        "Something Went Wrong",
        error.message || "An unexpected error occurred",
        onRetry && (
          <Button variant="solid" onClick={onRetry}>
            Try Again
          </Button>
        )
      );
    } else if (offline) {
      mainContent = renderStateContent(
        <WifiOff className="size-16 text-warning" />,
        "You're Offline",
        "Please check your internet connection and try again.",
        <Button variant="solid" onClick={() => window.location.reload()}>
          Retry
        </Button>
      );
    } else {
      mainContent = children;
    }

    return (
      <div
        ref={ref}
        className={clsx("flex min-h-screen flex-col", bgClass, className)}
        {...props}
      >
        {/* Skip to main content link */}
        <a
          href={`#${mainContentId}`}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-skip-link focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-badge focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {skipToMainLabel}
        </a>

        {/* Header - use custom header if provided, otherwise render default */}
        {header ? (
          header
        ) : (
          <header
            className={clsx(
              "sticky top-0 z-sticky-header border-b-2 backdrop-blur",
              isDark ? "border-grey-800 bg-ink-950/90" : "border-grey-200 bg-white/90"
            )}
          >
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
              <a
                href={appHref}
                className={clsx(
                  "font-display text-xl uppercase tracking-tight transition-transform hover:-translate-y-0.5",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded",
                  isDark ? "text-white" : "text-ink-900"
                )}
              >
                {appName}
              </a>
              {headerAction}
            </div>
          </header>
        )}

        {/* Main Content */}
        <FullBleedSection
          background={isDark ? "ink" : "grey"}
          pattern={showPattern ? patternType : "none"}
          patternOpacity={isDark ? 0.03 : 0.04}
          className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12 md:py-16"
        >
          <main id={mainContentId} tabIndex={-1} role="main" aria-label="Authentication content">
            <Container className={clsx("w-full", contentMaxWidthClasses[contentMaxWidth])}>
              {mainContent}
            </Container>
          </main>
        </FullBleedSection>

        {/* Footer */}
        <footer
          className={clsx(
            "border-t-2 py-6",
            isDark ? "border-grey-800 bg-ink-950" : "border-grey-200 bg-white"
          )}
        >
          <Container className="px-4 text-center sm:px-6">
            <Stack gap={4}>
              {footerLinks.length > 0 && (
                <nav aria-label="Footer navigation">
                  <Stack direction="horizontal" gap={4} className="flex-wrap justify-center">
                    {footerLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className={clsx(
                          "text-xs uppercase tracking-wide transition-colors",
                          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-1",
                          isDark
                            ? "text-grey-400 hover:text-white"
                            : "text-grey-500 hover:text-black"
                        )}
                      >
                        {link.label}
                      </a>
                    ))}
                  </Stack>
                </nav>
              )}
              <Label size="xxs" className={isDark ? "text-grey-500" : "text-grey-400"}>
                {copyright}
              </Label>
            </Stack>
          </Container>
        </footer>
      </div>
    );
  }
);

export default AuthPage;
