"use client";

import { forwardRef, ReactNode } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";
import { Container } from "./layout.js";
import { Display, H1, Body, Label } from "../atoms/typography.js";
import { Stack } from "./layout.js";

// =============================================================================
// PAGE HEADER - Standardized page header with kicker, title, description, actions
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Small kicker text above title */
  kicker?: string;
  /** Main page title */
  title: string | ReactNode;
  /** Description text below title */
  description?: string | ReactNode;
  /** Action buttons/elements on the right */
  actions?: ReactNode;
  /** Alignment of content */
  align?: "left" | "center";
  /** Use Display typography for title (larger) */
  displayTitle?: boolean;
  /** Dark/light theme */
  inverted?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(
  function PageHeader(
    {
      kicker,
      title,
      description,
      actions,
      align = "left",
      displayTitle = false,
      inverted = true,
      size = "md",
      className,
      ...props
    },
    ref
  ) {
    const sizeClasses = {
      sm: "gap-3 py-6",
      md: "gap-4 py-8 md:py-12",
      lg: "gap-6 py-12 md:py-16",
    };

    const alignClasses = {
      left: "",
      center: "text-center items-center",
    };

    const textClasses = inverted
      ? {
          kicker: "text-on-dark-muted",
          title: "text-white",
          description: "text-on-dark-secondary",
        }
      : {
          kicker: "text-muted",
          title: "text-black",
          description: "text-secondary",
        };

    return (
      <header
        ref={ref}
        className={clsx(
          "flex flex-col",
          sizeClasses[size],
          alignClasses[align],
          className
        )}
        {...props}
      >
        <Stack
          gap={align === "center" ? 4 : 6}
          className={clsx(
            "flex-1",
            align === "center" && "items-center text-center"
          )}
        >
          {kicker && (
            <Label
              size="xs"
              className={clsx(
                "uppercase tracking-[0.2em]",
                textClasses.kicker
              )}
            >
              {kicker}
            </Label>
          )}

          {displayTitle ? (
            typeof title === "string" ? (
              <Display size={size === "lg" ? "lg" : "md"} className={textClasses.title}>
                {title}
              </Display>
            ) : (
              title
            )
          ) : typeof title === "string" ? (
            <H1
              size={size === "sm" ? "sm" : size === "lg" ? "lg" : "md"}
              className={textClasses.title}
            >
              {title}
            </H1>
          ) : (
            title
          )}

          {description && (
            typeof description === "string" ? (
              <Body
                size={size === "sm" ? "sm" : "md"}
                className={clsx(
                  textClasses.description,
                  align === "center" ? "mx-auto max-w-2xl" : "max-w-3xl"
                )}
              >
                {description}
              </Body>
            ) : (
              description
            )
          )}
        </Stack>

        {actions && (
          <div className={clsx("flex gap-4", align === "center" && "justify-center")}>
            {actions}
          </div>
        )}
      </header>
    );
  }
);

// =============================================================================
// PAGE CONTENT - Main content area with consistent padding
// =============================================================================

export interface PageContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Container size */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Vertical padding */
  padding?: "none" | "sm" | "md" | "lg";
  /** Dark/light theme */
  inverted?: boolean;
}

export const PageContent = forwardRef<HTMLDivElement, PageContentProps>(
  function PageContent(
    {
      size = "lg",
      padding = "md",
      inverted: _inverted = true,
      className,
      children,
      ...props
    },
    ref
  ) {
    const paddingClasses = {
      none: "",
      sm: "py-6",
      md: "py-8 md:py-12",
      lg: "py-12 md:py-16",
    };

    return (
      <div
        ref={ref}
        className={clsx(paddingClasses[padding], className)}
        {...props}
      >
        <Container size={size}>{children}</Container>
      </div>
    );
  }
);

// =============================================================================
// PAGE FOOTER - Page-level footer (distinct from site footer)
// =============================================================================

export interface PageFooterProps extends HTMLAttributes<HTMLElement> {
  /** Dark/light theme */
  inverted?: boolean;
}

export const PageFooter = forwardRef<HTMLElement, PageFooterProps>(
  function PageFooter({ inverted = true, className, children, ...props }, ref) {
    return (
      <footer
        ref={ref}
        className={clsx(
          "border-t-2 py-8",
          inverted ? "border-grey-800" : "border-grey-200",
          className
        )}
        {...props}
      >
        <Container>{children}</Container>
      </footer>
    );
  }
);

// =============================================================================
// SPLIT LAYOUT - Two-column layout (main + aside)
// =============================================================================

export interface SplitLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /** Main content (left/top) */
  main: ReactNode;
  /** Aside content (right/bottom) */
  aside: ReactNode;
  /** Aside position */
  asidePosition?: "left" | "right";
  /** Aside width ratio (out of 12) */
  asideWidth?: 3 | 4 | 5;
  /** Gap between columns */
  gap?: "sm" | "md" | "lg";
  /** Stack on mobile */
  stackOnMobile?: boolean;
  /** Reverse stack order on mobile */
  reverseOnMobile?: boolean;
}

export const SplitLayout = forwardRef<HTMLDivElement, SplitLayoutProps>(
  function SplitLayout(
    {
      main,
      aside,
      asidePosition = "right",
      asideWidth = 4,
      gap = "md",
      stackOnMobile = true,
      reverseOnMobile = false,
      className,
      ...props
    },
    ref
  ) {
    const gapClasses = {
      sm: "gap-4 lg:gap-6",
      md: "gap-6 lg:gap-8",
      lg: "gap-8 lg:gap-12",
    };

    const mainWidth = 12 - asideWidth;
    const gridCols = stackOnMobile
      ? `grid-cols-1 lg:grid-cols-12`
      : `grid-cols-12`;

    const mainColSpan = `lg:col-span-${mainWidth}`;
    const asideColSpan = `lg:col-span-${asideWidth}`;

    const mainOrder = asidePosition === "left" ? "lg:order-2" : "lg:order-1";
    const asideOrder = asidePosition === "left" ? "lg:order-1" : "lg:order-2";

    return (
      <div
        ref={ref}
        className={clsx("grid", gridCols, gapClasses[gap], className)}
        {...props}
      >
        <div
          className={clsx(
            mainColSpan,
            mainOrder,
            reverseOnMobile && "order-2 lg:order-1"
          )}
        >
          {main}
        </div>
        <aside
          className={clsx(
            asideColSpan,
            asideOrder,
            reverseOnMobile && "order-1 lg:order-2"
          )}
        >
          {aside}
        </aside>
      </div>
    );
  }
);

// =============================================================================
// FULL BLEED SECTION - Edge-to-edge section without container
// =============================================================================

export interface FullBleedSectionProps extends HTMLAttributes<HTMLElement> {
  /** Background color */
  background?: "black" | "white" | "grey" | "ink" | "primary" | "accent";
  /** Add pattern overlay */
  pattern?: "grid" | "halftone" | "none";
  /** Pattern opacity */
  patternOpacity?: number;
}

export const FullBleedSection = forwardRef<HTMLElement, FullBleedSectionProps>(
  function FullBleedSection(
    {
      background = "black",
      pattern = "none",
      patternOpacity = 0.03,
      className,
      children,
      ...props
    },
    ref
  ) {
    const bgClasses: Record<string, string> = {
      black: "bg-black text-white",
      white: "bg-white text-black",
      grey: "bg-grey-100 text-black",
      ink: "bg-ink-950 text-white",
      primary: "bg-primary text-white",
      accent: "bg-accent text-black",
    };

    const isDark = ["black", "ink", "primary"].includes(background);

    const getPatternStyle = (): React.CSSProperties | undefined => {
      if (pattern === "none") return undefined;

      if (pattern === "grid") {
        return {
          backgroundImage: `linear-gradient(${isDark ? "#fff" : "#000"} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? "#fff" : "#000"} 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        };
      }

      if (pattern === "halftone") {
        return {
          backgroundImage: `radial-gradient(circle, ${isDark ? "#fff" : "#000"} 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        };
      }

      return undefined;
    };

    return (
      <section
        ref={ref}
        className={clsx("relative overflow-hidden", bgClasses[background], className)}
        {...props}
      >
        {pattern !== "none" && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              ...getPatternStyle(),
              opacity: patternOpacity,
            }}
            aria-hidden="true"
          />
        )}
        <div className="relative z-10">{children}</div>
      </section>
    );
  }
);

// =============================================================================
// CONTENT REGION - Generic content region with semantic meaning
// =============================================================================

export interface ContentRegionProps extends HTMLAttributes<HTMLDivElement> {
  /** Region type for semantic meaning */
  as?: "div" | "section" | "article" | "aside";
  /** Vertical padding */
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  /** Border styling */
  bordered?: boolean;
  /** Dark/light theme */
  inverted?: boolean;
}

export const ContentRegion = forwardRef<HTMLDivElement, ContentRegionProps>(
  function ContentRegion(
    {
      as: Component = "div",
      padding = "md",
      bordered = false,
      inverted = true,
      className,
      children,
      ...props
    },
    ref
  ) {
    const paddingClasses = {
      none: "",
      sm: "py-4",
      md: "py-6 md:py-8",
      lg: "py-8 md:py-12",
      xl: "py-12 md:py-16",
    };

    const borderClasses = bordered
      ? inverted
        ? "border-2 border-grey-800 rounded-[var(--radius-card)] p-6"
        : "border-2 border-grey-200 rounded-[var(--radius-card)] p-6"
      : "";

    return (
      <Component
        ref={ref as React.Ref<HTMLDivElement>}
        className={clsx(paddingClasses[padding], borderClasses, className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
