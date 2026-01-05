"use client";

import { forwardRef, ReactNode } from "react";
import clsx from "clsx";
import { authPageVariants } from "./AuthPage.variants.js";
import type { AuthPageProps } from "./AuthPage.types.js";
import { Container, Stack } from "../../foundations/layout.js";
import { FullBleedSection } from "../../foundations/page-regions.js";
import { Label, Body, H2 } from "../../atoms/Typography/index.js";
import { Spinner } from "../../atoms/Spinner/index.js";
import { Button } from "../../atoms/Button/index.js";
import { AlertTriangle, WifiOff } from "lucide-react";

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
      title,
      subtitle,
      footer: footerLink,
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
          ? "bg-surface-inverse text-text-primary"
          : "bg-surface-primary text-text-primary"
      : isDark
        ? "bg-surface-inverse text-text-primary"
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
          <H2 className={isDark ? "text-text-primary" : "text-text-primary"}>{title}</H2>
          <Body className={isDark ? "text-text-muted" : "text-text-muted"}>{message}</Body>
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
      mainContent = (
        <Stack gap={6}>
          {(title || subtitle) && (
            <Stack gap={2} className="text-center">
              {title && <H2 className={isDark ? "text-text-primary" : "text-text-primary"}>{title}</H2>}
              {subtitle && <Body className={isDark ? "text-text-muted" : "text-text-muted"}>{subtitle}</Body>}
            </Stack>
          )}
          {children}
          {footerLink && (
            <div className="text-center mt-4">
              <Body size="sm" className={isDark ? "text-text-muted" : "text-text-muted"}>
                {footerLink.text}{" "}
                <a href={footerLink.linkHref} className="text-primary hover:underline font-medium">{footerLink.linkText}</a>
              </Body>
            </div>
          )}
        </Stack>
      );
    }

    return (
      <div
        ref={ref}
        className={clsx(authPageVariants({ background, inverted }), bgClass, className)}
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
              isDark ? "border-border bg-surface-inverse/90" : "border-border bg-surface-primary/90"
            )}
          >
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
              <a
                href={appHref}
                className={clsx(
                  "font-display text-xl uppercase tracking-tight transition-transform hover:-translate-y-0.5",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded",
                  isDark ? "text-text-primary" : "text-text-primary"
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
          className="flex flex-1 items-center justify-center px-4 py-4 sm:px-6 sm:py-6"
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
            isDark ? "border-border bg-surface-inverse" : "border-border bg-surface-primary"
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
                            ? "text-text-muted hover:text-white"
                            : "text-text-muted hover:text-black"
                        )}
                      >
                        {link.label}
                      </a>
                    ))}
                  </Stack>
                </nav>
              )}
              <Label size="xxs" className={isDark ? "text-text-disabled" : "text-text-muted"}>
                {copyright}
              </Label>
            </Stack>
          </Container>
        </footer>
      </div>
    );
  }
);

AuthPage.displayName = "AuthPage";

export default AuthPage;
