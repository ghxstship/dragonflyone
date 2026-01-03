"use client";

import { ReactNode, forwardRef } from "react";
import clsx from "clsx";
import { Stack, Container, Section } from "../foundations/layout.js";
import { H1, Body } from "../atoms/typography.js";
import { Button } from "../atoms/button.js";
import { Home, ArrowLeft, LayoutDashboard, Search } from "lucide-react";

// =============================================================================
// NOT FOUND PAGE TEMPLATE
// 404 error display with navigation options
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

export interface NotFoundContentProps {
  /** Show dashboard button */
  showDashboard?: boolean;
  /** Dashboard path */
  dashboardPath?: string;
  /** Custom message */
  message?: string;
  /** Home path (defaults to /) */
  homePath?: string;
  /** Home button label */
  homeLabel?: string;
  /** Dark/light theme */
  inverted?: boolean;
  /** Custom title */
  title?: string;
  /** Custom error code */
  errorCode?: string;
  /** Show search suggestion */
  showSearch?: boolean;
  /** Search path */
  searchPath?: string;
  /** Custom actions */
  actions?: ReactNode;
}

/**
 * NotFoundContent - Content-only 404 component for use inside app layouts
 * 
 * Features:
 * - Giant bold 404 display with gradient
 * - Comic-style presentation
 * - Clear navigation options (home, back, dashboard)
 * - Optional search suggestion
 * - Dark-first design
 * 
 * Use cases:
 * - 404 pages
 * - Missing resource pages
 * - Invalid route handling
 */
export function NotFoundContent({
  showDashboard = true,
  dashboardPath = "/dashboard",
  message = "The page you are looking for doesn't exist or has been moved.",
  homePath = "/",
  homeLabel = "Go Home",
  inverted = true,
  title = "Page Not Found",
  errorCode = "404",
  showSearch = false,
  searchPath = "/search",
  actions,
}: NotFoundContentProps) {
  const textClass = inverted ? "text-on-dark-primary" : "text-on-light-primary";
  const mutedTextClass = inverted ? "text-on-dark-muted" : "text-on-light-muted";

  return (
    <Stack gap={8} className="flex min-h-[60vh] flex-col items-center justify-center text-center py-8">
      {/* Giant error code with comic style */}
      <div
        className={clsx(
          "relative inline-block select-none",
          "text-[8rem] sm:text-[10rem] md:text-[14rem] font-display font-black leading-none",
          "text-transparent bg-clip-text",
          inverted
            ? "bg-gradient-to-br from-on-dark-primary via-on-dark-secondary to-on-dark-muted"
            : "bg-gradient-to-br from-on-light-primary via-on-light-secondary to-on-light-muted",
          "drop-shadow-[8px_8px_0_rgba(0,0,0,0.2)]"
        )}
        aria-hidden="true"
      >
        {errorCode}
      </div>

      {/* Title and message */}
      <Stack gap={4} className="max-w-lg">
        <H1 className={clsx(textClass, "uppercase tracking-wider")}>{title}</H1>
        <Body className={mutedTextClass}>{message}</Body>
      </Stack>

      {/* Actions */}
      {actions || (
        <Stack gap={4} direction="horizontal" className="flex-wrap justify-center">
          <Button variant="solid" onClick={() => (window.location.href = homePath)}>
            <Home className="size-4 mr-2" />
            {homeLabel}
          </Button>
          <Button variant="outline" inverted={inverted} onClick={() => window.history.back()}>
            <ArrowLeft className="size-4 mr-2" />
            Go Back
          </Button>
          {showDashboard && (
            <Button
              variant="ghost"
              inverted={inverted}
              onClick={() => (window.location.href = dashboardPath)}
            >
              <LayoutDashboard className="size-4 mr-2" />
              Dashboard
            </Button>
          )}
          {showSearch && (
            <Button
              variant="ghost"
              inverted={inverted}
              onClick={() => (window.location.href = searchPath)}
            >
              <Search className="size-4 mr-2" />
              Search
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
}

export interface NotFoundPageProps {
  /** Navigation component to render at top */
  navigation?: ReactNode;
  /** Background color */
  background?: "ink" | "black" | "white";
  /** Dark/light theme */
  inverted?: boolean;
  /** Show dashboard button */
  showDashboard?: boolean;
  /** Dashboard path */
  dashboardPath?: string;
  /** Custom message */
  message?: string;
  /** Home path */
  homePath?: string;
  /** Custom title */
  title?: string;
  /** Custom error code */
  errorCode?: string;
  /** Show search suggestion */
  showSearch?: boolean;
  /** Search path */
  searchPath?: string;
  /** Skip to main content label */
  skipToMainLabel?: string;
  /** Main content id */
  mainContentId?: string;
}

/**
 * NotFoundPage - Full page 404 template
 * 
 * Features:
 * - Giant bold 404 display with gradient
 * - Comic-style presentation
 * - Clear navigation options (home, back, dashboard)
 * - Skip to main content accessibility link
 * - Dark-first design
 * 
 * Use cases:
 * - Next.js not-found.tsx pages
 * - Root 404 pages
 * - Missing route handling
 */
export const NotFoundPage = forwardRef<HTMLDivElement, NotFoundPageProps>(
  function NotFoundPage(
    {
      navigation,
      background = "ink",
      inverted = true,
      showDashboard = true,
      dashboardPath = "/dashboard",
      message = "The page you are looking for doesn't exist or has been moved.",
      homePath = "/",
      title,
      errorCode,
      showSearch,
      searchPath,
      skipToMainLabel = "Skip to main content",
      mainContentId = "main-content",
    },
    ref
  ) {
    const bgClass =
      background === "ink"
        ? "bg-surface-inverse"
        : background === "black"
          ? "bg-black"
          : "bg-white";
    const isDark = background !== "white" || inverted;

    return (
      <Section
        ref={ref}
        className={clsx(
          "relative min-h-screen overflow-hidden",
          bgClass,
          isDark ? "text-on-dark-primary" : "text-on-light-primary"
        )}
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
        <div
          className="pointer-events-none absolute inset-0 bg-grid opacity-10"
          aria-hidden="true"
        />

        {navigation}

        <main
          id={mainContentId}
          tabIndex={-1}
          role="main"
          aria-label="Page not found"
        >
          <Container className="py-16">
            <NotFoundContent
              showDashboard={showDashboard}
              dashboardPath={dashboardPath}
              message={message}
              homePath={homePath}
              inverted={isDark}
              title={title}
              errorCode={errorCode}
              showSearch={showSearch}
              searchPath={searchPath}
            />
          </Container>
        </main>
      </Section>
    );
  }
);

export default NotFoundPage;
