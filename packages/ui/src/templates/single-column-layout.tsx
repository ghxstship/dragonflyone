"use client";

import { forwardRef, ReactNode, useState, useEffect } from "react";
import clsx from "clsx";
import { Container, Stack } from "../foundations/layout.js";
import { Spinner } from "../atoms/spinner.js";
import { Body, H2 } from "../atoms/typography.js";
import { Button } from "../atoms/button.js";
import { AlertTriangle, ChevronUp } from "lucide-react";

// =============================================================================
// SINGLE COLUMN LAYOUT
// Linear scrolling content, single column.
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

export interface TableOfContentsItem {
  id: string;
  label: string;
  level?: 1 | 2 | 3;
}

export interface SingleColumnLayoutProps {
  children: ReactNode;
  /** Content width */
  width?: "prose" | "medium" | "wide" | "full";
  /** Header configuration */
  header?: "none" | "fixed" | "sticky";
  /** Header content */
  headerContent?: ReactNode;
  /** Footer configuration */
  footer?: "none" | "fixed" | "sticky";
  /** Footer content */
  footerContent?: ReactNode;
  /** Table of contents position */
  toc?: "none" | "left" | "right";
  /** Table of contents items */
  tocItems?: TableOfContentsItem[];
  /** Hero section */
  hero?: "none" | "image" | "color";
  /** Hero content */
  heroContent?: ReactNode;
  /** Hero image URL (when hero="image") */
  heroImage?: string;
  /** Hero background color (when hero="color") */
  heroColor?: "primary" | "secondary" | "accent" | "ink";
  /** Content padding */
  padding?: "padded" | "flush";
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
  /** Show scroll to top button */
  showScrollTop?: boolean;
  /** Custom className */
  className?: string;
}

const widthClasses = {
  prose: "max-w-prose", // ~65ch
  medium: "max-w-3xl", // ~900px
  wide: "max-w-5xl", // ~1200px
  full: "max-w-full",
};

const heroColorClasses = {
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-white",
  accent: "bg-accent text-text-primary",
  ink: "bg-surface-inverse text-text-primary",
};

/**
 * SingleColumnLayout - Linear scrolling content layout
 * 
 * Use cases:
 * - Articles/blog posts
 * - Documentation
 * - Legal pages (terms, privacy)
 * - Long-form content
 * - Landing pages
 * - Print-optimized views
 * 
 * Features:
 * - Prose width optimization for reading
 * - Optional table of contents sidebar
 * - Hero section support
 * - Fixed/sticky header/footer
 * - Loading, error, empty state variants
 * - Scroll to top button
 * - Responsive design
 * - Accessibility compliant
 */
export const SingleColumnLayout = forwardRef<HTMLDivElement, SingleColumnLayoutProps>(
  function SingleColumnLayout(
    {
      children,
      width = "medium",
      header = "none",
      headerContent,
      footer = "none",
      footerContent,
      toc = "none",
      tocItems = [],
      hero = "none",
      heroContent,
      heroImage,
      heroColor = "primary",
      padding = "padded",
      inverted = true,
      loading = false,
      loadingMessage = "Loading...",
      error = null,
      onRetry,
      empty = false,
      emptyMessage = "No content available",
      emptyAction,
      showScrollTop = true,
      className,
    },
    ref
  ) {
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>(null);

    const bgClass = inverted ? "bg-surface-inverse text-text-primary" : "bg-surface-primary text-text-primary";
    const borderClass = inverted ? "border-border" : "border-border";

    // Scroll to top visibility
    useEffect(() => {
      if (!showScrollTop) return;

      const handleScroll = () => {
        setShowScrollButton(window.scrollY > 400);
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }, [showScrollTop]);

    // Active section tracking for TOC
    useEffect(() => {
      if (toc === "none" || tocItems.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(entry.target.id);
            }
          });
        },
        { rootMargin: "-20% 0px -80% 0px" }
      );

      tocItems.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element) observer.observe(element);
      });

      return () => observer.disconnect();
    }, [toc, tocItems]);

    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const scrollToSection = (id: string) => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    // Loading state
    if (loading) {
      return (
        <div ref={ref} className={clsx("min-h-screen flex flex-col", bgClass, className)}>
          {headerContent && header !== "none" && (
            <header className={clsx(
              "border-b-2 backdrop-blur",
              header === "fixed" && "fixed top-0 left-0 right-0 z-sticky-header",
              header === "sticky" && "sticky top-0 z-sticky-header",
              borderClass,
              inverted ? "bg-surface-inverse/90" : "bg-surface-primary/90"
            )}>
              {headerContent}
            </header>
          )}
          <div className="flex-1 flex items-center justify-center p-8">
            <Stack gap={4} className="items-center text-center">
              <Spinner size="lg" />
              <Body className={inverted ? "text-text-muted" : "text-text-muted"}>
                {loadingMessage}
              </Body>
            </Stack>
          </div>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div ref={ref} className={clsx("min-h-screen flex flex-col", bgClass, className)}>
          {headerContent && header !== "none" && (
            <header className={clsx(
              "border-b-2 backdrop-blur",
              header === "fixed" && "fixed top-0 left-0 right-0 z-sticky-header",
              header === "sticky" && "sticky top-0 z-sticky-header",
              borderClass,
              inverted ? "bg-surface-inverse/90" : "bg-surface-primary/90"
            )}>
              {headerContent}
            </header>
          )}
          <div className="flex-1 flex items-center justify-center p-8">
            <Stack gap={6} className="items-center text-center max-w-md">
              <AlertTriangle className="size-16 text-error animate-shake" />
              <Stack gap={2} className="items-center">
                <H2 className={inverted ? "text-text-primary" : "text-text-primary"}>
                  Error Loading Content
                </H2>
                <Body className={inverted ? "text-text-muted" : "text-text-muted"}>
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
        </div>
      );
    }

    // Empty state
    if (empty) {
      return (
        <div ref={ref} className={clsx("min-h-screen flex flex-col", bgClass, className)}>
          {headerContent && header !== "none" && (
            <header className={clsx(
              "border-b-2 backdrop-blur",
              header === "fixed" && "fixed top-0 left-0 right-0 z-sticky-header",
              header === "sticky" && "sticky top-0 z-sticky-header",
              borderClass,
              inverted ? "bg-surface-inverse/90" : "bg-surface-primary/90"
            )}>
              {headerContent}
            </header>
          )}
          <div className="flex-1 flex items-center justify-center p-8">
            <Stack gap={6} className="items-center text-center max-w-md">
              <div className={clsx(
                "size-20 rounded-full flex items-center justify-center border-2",
                inverted ? "border-border bg-surface-elevated" : "border-border bg-muted"
              )}>
                <div className={clsx(
                  "size-10 rounded-full",
                  inverted ? "bg-surface-elevated" : "bg-muted"
                )} />
              </div>
              <Body className={inverted ? "text-text-muted" : "text-text-muted"}>
                {emptyMessage}
              </Body>
              {emptyAction && (
                <Button variant="solid" onClick={emptyAction.onClick}>
                  {emptyAction.label}
                </Button>
              )}
            </Stack>
          </div>
        </div>
      );
    }

    // Table of contents sidebar
    const tocSidebar = toc !== "none" && tocItems.length > 0 && (
      <aside className={clsx(
        "hidden lg:block w-64 shrink-0",
        toc === "left" ? "order-first" : "order-last"
      )}>
        <nav className={clsx(
          "sticky top-24 p-4 border-2 rounded-card",
          borderClass,
          inverted ? "bg-surface-elevated" : "bg-muted"
        )}>
          <Body className={clsx(
            "font-semibold mb-4 uppercase text-xs tracking-wider",
            inverted ? "text-text-muted" : "text-text-muted"
          )}>
            On This Page
          </Body>
          <Stack gap={1}>
            {tocItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={clsx(
                  "text-left px-3 py-2 rounded-button text-sm transition-colors",
                  item.level === 2 && "pl-6",
                  item.level === 3 && "pl-9",
                  activeSection === item.id
                    ? inverted
                      ? "bg-primary/20 text-primary border-l-2 border-primary"
                      : "bg-primary/10 text-primary border-l-2 border-primary"
                    : inverted
                      ? "text-text-muted hover:text-text-primary hover:bg-surface-elevated"
                      : "text-text-disabled hover:text-text-primary hover:bg-muted"
                )}
              >
                {item.label}
              </button>
            ))}
          </Stack>
        </nav>
      </aside>
    );

    return (
      <div ref={ref} className={clsx("min-h-screen flex flex-col", bgClass, className)}>
        {/* Header */}
        {headerContent && header !== "none" && (
          <header className={clsx(
            "border-b-2 backdrop-blur z-sticky-header",
            header === "fixed" && "fixed top-0 left-0 right-0",
            header === "sticky" && "sticky top-0",
            borderClass,
            inverted ? "bg-surface-inverse/90" : "bg-surface-primary/90"
          )}>
            {headerContent}
          </header>
        )}

        {/* Hero Section */}
        {hero !== "none" && (
          <div className={clsx(
            "relative",
            hero === "image" && "min-h-[40vh] md:min-h-[50vh]",
            hero === "color" && heroColorClasses[heroColor]
          )}>
            {hero === "image" && heroImage && (
              <>
                <img
                  src={heroImage}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
              </>
            )}
            <Container className={clsx(
              "relative z-content-overlay py-12 md:py-20",
              widthClasses[width]
            )}>
              {heroContent}
            </Container>
          </div>
        )}

        {/* Main Content Area */}
        <div className={clsx(
          "flex-1",
          header === "fixed" && headerContent && "mt-16"
        )}>
          <Container className={clsx(
            padding === "padded" ? "py-8 md:py-12" : "",
            toc !== "none" ? "max-w-6xl" : widthClasses[width]
          )}>
            <div className={clsx(
              toc !== "none" && "flex gap-8 lg:gap-12"
            )}>
              {toc === "left" && tocSidebar}
              
              <main className={clsx(
                "flex-1 min-w-0",
                toc !== "none" && widthClasses[width]
              )}>
                <article className={clsx(
                  "prose prose-lg",
                  inverted && "prose-invert",
                  "max-w-none"
                )}>
                  {children}
                </article>
              </main>

              {toc === "right" && tocSidebar}
            </div>
          </Container>
        </div>

        {/* Footer */}
        {footerContent && footer !== "none" && (
          <footer className={clsx(
            "border-t-2",
            footer === "fixed" && "fixed bottom-0 left-0 right-0 z-sticky-header",
            footer === "sticky" && "sticky bottom-0 z-sticky-header",
            borderClass,
            inverted ? "bg-surface-inverse" : "bg-surface-primary"
          )}>
            {footerContent}
          </footer>
        )}

        {/* Scroll to Top Button */}
        {showScrollTop && showScrollButton && (
          <button
            onClick={scrollToTop}
            className={clsx(
              "fixed bottom-6 right-6 z-tooltip p-3 rounded-full border-2 transition-all",
              "hover:-translate-y-1 hover:shadow-lg",
              inverted
                ? "bg-surface-elevated border-border text-text-primary hover:bg-surface-inverse"
                : "bg-surface-primary border-border text-text-primary hover:bg-muted"
            )}
            aria-label="Scroll to top"
          >
            <ChevronUp className="size-5" />
          </button>
        )}
      </div>
    );
  }
);

export default SingleColumnLayout;
