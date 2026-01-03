"use client";

import { forwardRef, ReactNode } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";
import { Container, Stack } from "../foundations/layout.js";
import { Label, Body, H1 } from "../atoms/typography.js";
import { Spinner } from "../atoms/spinner.js";
import { Button } from "../atoms/button.js";
import { AlertTriangle, WifiOff } from "lucide-react";

// =============================================================================
// AUTH SPLIT LAYOUT TEMPLATE
// Modern split-screen authentication layout (Stripe/Linear/Vercel style)
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

export interface AuthSplitLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Brand panel content - left side on desktop */
  brandPanel?: ReactNode;
  /** Brand panel background - gradient, image, or solid color */
  brandBackground?: "gradient" | "pattern" | "image" | "solid";
  /** Custom brand background class or image URL */
  brandBackgroundCustom?: string;
  /** Brand logo/name for header */
  brandLogo?: ReactNode;
  /** Brand tagline for brand panel */
  brandTagline?: string;
  /** Brand features/benefits list */
  brandFeatures?: Array<{ icon?: ReactNode; title: string; description?: string }>;
  /** Testimonial for brand panel */
  testimonial?: { quote: string; author: string; role?: string; avatar?: string };
  /** Form panel title */
  title?: string;
  /** Form panel subtitle */
  subtitle?: string;
  /** Footer link (e.g., "Already have an account? Sign in") */
  footer?: { text: string; linkText: string; linkHref: string };
  /** Main form content */
  children: ReactNode;
  /** Footer links */
  footerLinks?: Array<{ label: string; href: string }>;
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
  /** Hide brand panel (single column mode) */
  singleColumn?: boolean;
  /** Form panel max width */
  formMaxWidth?: "sm" | "md" | "lg";
}

const formMaxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

/**
 * AuthSplitLayout - Modern split-screen authentication template
 * 
 * Features:
 * - Split layout: Brand panel (left) + Form panel (right)
 * - Responsive: Collapses to single column on mobile
 * - Brand panel supports gradients, patterns, images
 * - Loading, error, offline state variants
 * - Skip to main content accessibility link
 * - Dark-first design following GHXSTSHIP aesthetic
 * 
 * Use cases:
 * - Sign in pages (with product showcase)
 * - Sign up pages (with benefits/features)
 * - Can be used in single-column mode for simpler flows
 */
export const AuthSplitLayout = forwardRef<HTMLDivElement, AuthSplitLayoutProps>(
  function AuthSplitLayout(
    {
      brandPanel,
      brandBackground = "gradient",
      brandBackgroundCustom,
      brandLogo,
      brandTagline,
      brandFeatures,
      testimonial,
      title,
      subtitle,
      footer: footerLink,
      children,
      footerLinks = [
        { label: "Privacy", href: "/legal/privacy" },
        { label: "Terms", href: "/legal/terms" },
        { label: "Help", href: "/help" },
      ],
      copyright = `© ${new Date().getFullYear()} GHXSTSHIP INDUSTRIES`,
      loading = false,
      loadingMessage = "Loading...",
      error = null,
      onRetry,
      offline = false,
      skipToMainLabel = "Skip to main content",
      mainContentId = "main-content",
      singleColumn = false,
      formMaxWidth = "md",
      className,
      ...props
    },
    ref
  ) {
    // Brand panel background classes
    const getBrandBackgroundClass = () => {
      if (brandBackgroundCustom) return brandBackgroundCustom;
      
      switch (brandBackground) {
        case "gradient":
          return "bg-primary-600";
        case "pattern":
          return "bg-surface-inverse bg-halftone";
        case "solid":
          return "bg-primary-600";
        case "image":
          return "bg-surface-inverse";
        default:
          return "bg-primary-600";
      }
    };

    // Render state content (loading, error, offline)
    const renderStateContent = (
      icon: ReactNode,
      stateTitle: string,
      message: string,
      action?: ReactNode
    ) => (
      <Stack gap={6} className="items-center text-center">
        {icon}
        <Stack gap={2} className="items-center">
          <H1 className="text-on-dark-primary text-2xl">{stateTitle}</H1>
          <Body className="text-on-dark-muted">{message}</Body>
        </Stack>
        {action}
      </Stack>
    );

    // Determine main content based on state
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
        <Stack gap={8} className="w-full">
          {/* Form Header */}
          {(title || subtitle) && (
            <Stack gap={3}>
              {title && (
                <H1 className="text-on-dark-primary text-3xl md:text-4xl font-display uppercase tracking-tight">
                  {title}
                </H1>
              )}
              {subtitle && (
                <Body size="lg" className="text-on-dark-secondary">
                  {subtitle}
                </Body>
              )}
            </Stack>
          )}

          {/* Form Content */}
          <div className="w-full">{children}</div>

          {/* Footer Link */}
          {footerLink && (
            <div className="text-center pt-4">
              <Body size="sm" className="text-on-dark-muted">
                {footerLink.text}{" "}
                <a
                  href={footerLink.linkHref}
                  className="text-primary-400 hover:text-primary-300 font-semibold transition-colors underline-offset-4 hover:underline"
                >
                  {footerLink.linkText}
                </a>
              </Body>
            </div>
          )}
        </Stack>
      );
    }

    // Default brand panel content
    const defaultBrandContent = (
      <Stack gap={10} className="h-full justify-between p-8 lg:p-12">
        {/* Logo */}
        {brandLogo && (
          <div className="flex-shrink-0">
            {brandLogo}
          </div>
        )}

        {/* Main Brand Content */}
        <Stack gap={8} className="flex-1 justify-center">
          {brandTagline && (
            <H1 className="text-on-dark-primary text-3xl lg:text-4xl xl:text-5xl font-display uppercase tracking-tight leading-tight">
              {brandTagline}
            </H1>
          )}

          {brandFeatures && brandFeatures.length > 0 && (
            <Stack gap={4}>
              {brandFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  {feature.icon && (
                    <div className="flex-shrink-0 p-2 bg-surface-inverse/10 rounded-card border-2 border-surface-inverse/20">
                      {feature.icon}
                    </div>
                  )}
                  <Stack gap={1}>
                    <Body className="text-on-dark-primary font-semibold">{feature.title}</Body>
                    {feature.description && (
                      <Body size="sm" className="text-on-dark-secondary">{feature.description}</Body>
                    )}
                  </Stack>
                </div>
              ))}
            </Stack>
          )}
        </Stack>

        {/* Testimonial */}
        {testimonial && (
          <div className="flex-shrink-0 p-6 bg-surface-inverse/10 rounded-card border-2 border-surface-inverse/20 backdrop-blur-sm">
            <Stack gap={4}>
              <Body className="text-on-dark-primary italic leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </Body>
              <div className="flex items-center gap-3">
                {testimonial.avatar && (
                  <div 
                    className="size-10 rounded-[var(--radius-circle)] border-2 border-surface-inverse/30 bg-cover bg-center"
                    style={{ backgroundImage: `url(${testimonial.avatar})` }}
                    role="img"
                    aria-label={testimonial.author}
                  />
                )}
                <Stack gap={0}>
                  <Body size="sm" className="text-on-dark-primary font-semibold">{testimonial.author}</Body>
                  {testimonial.role && (
                    <Body size="xs" className="text-on-dark-muted">{testimonial.role}</Body>
                  )}
                </Stack>
              </div>
            </Stack>
          </div>
        )}
      </Stack>
    );

    return (
      <div
        ref={ref}
        className={clsx("flex flex-col h-screen overflow-hidden", className)}
        {...props}
      >
        {/* Skip to main content link */}
        <a
          href={`#${mainContentId}`}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-skip-link focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-badge focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {skipToMainLabel}
        </a>

        {/* Main Content Area - Split panels */}
        <div className="flex flex-1">
          {/* Brand Panel - Hidden on mobile, shown on lg+ */}
          {!singleColumn && (
            <div
              className={clsx(
                "hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden",
                getBrandBackgroundClass()
              )}
            >
              {/* Pattern overlay */}
              <div className="absolute inset-0 bg-grid opacity-[0.03]" />
              
              {/* Content */}
              <div className="relative z-10 w-full">
                {brandPanel || defaultBrandContent}
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-20 -right-20 size-80 bg-surface-inverse/5 rounded-[var(--radius-circle)]" />
              <div className="absolute -top-10 -left-10 size-60 bg-surface-inverse/5 rounded-[var(--radius-circle)]" />
            </div>
          )}

          {/* Form Panel - Dark theme to match GHXSTSHIP aesthetic */}
          <div
            className={clsx(
              "flex flex-col w-full bg-surface-primary",
              !singleColumn && "lg:w-1/2 xl:w-[45%]"
            )}
          >
          {/* Mobile Header - Only shown on mobile when not single column */}
          {!singleColumn && (
            <header className="lg:hidden sticky top-0 z-sticky-header border-b-2 border-border bg-surface-primary/95 backdrop-blur">
              <div className="flex items-center justify-between px-4 py-4">
                {brandLogo || (
                  <span className="font-display text-lg uppercase tracking-tight text-white">
                    GHXSTSHIP
                  </span>
                )}
              </div>
            </header>
          )}

          {/* Main Form Area - Scrollable if content overflows */}
          <main
            id={mainContentId}
            tabIndex={-1}
            role="main"
            aria-label="Authentication content"
            className="flex-1 flex items-center justify-center px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:px-12 overflow-y-auto"
          >
            <Container className={clsx("w-full", formMaxWidthClasses[formMaxWidth])}>
              {mainContent}
            </Container>
          </main>
          </div>
        </div>

        {/* Footer - Full width spanning both panels, compact */}
        <footer className="flex-shrink-0 border-t-2 border-border bg-surface-secondary py-2">
          <Container className="px-4 text-center sm:px-6">
            <Stack gap={2}>
              {footerLinks.length > 0 && (
                <nav aria-label="Footer navigation">
                  <Stack direction="horizontal" gap={4} className="flex-wrap justify-center">
                    {footerLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className="text-xs uppercase tracking-wide text-on-dark-muted hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-secondary rounded px-1"
                      >
                        {link.label}
                      </a>
                    ))}
                  </Stack>
                </nav>
              )}
              <Label size="xxs" className="text-on-dark-disabled">
                {copyright}
              </Label>
            </Stack>
          </Container>
        </footer>
      </div>
    );
  }
);

export default AuthSplitLayout;
