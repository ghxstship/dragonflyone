import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export const Container = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" | "lg" | "xl" | "full" }>(
  function Container({ size = "lg", className, children, ...props }, ref) {
    const sizeClasses = {
      sm: "max-w-screen-sm",
      md: "max-w-screen-md",
      lg: "max-w-screen-lg",
      xl: "max-w-screen-xl",
      full: "max-w-full",
    };

    return (
      <div
        ref={ref}
        className={clsx("mx-auto px-spacing-4", sizeClasses[size], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export type SectionProps = HTMLAttributes<HTMLElement> & {
  /** Background color scheme */
  background?: "white" | "black" | "grey" | "ink" | "transparent";
  /** Whether to use full width without container */
  fullWidth?: boolean;
  /** Remove default vertical padding */
  noPadding?: boolean;
  /** Add border styling */
  border?: boolean;
  /** Kicker text above title */
  kicker?: string;
  /** Section title */
  title?: string | ReactNode;
  /** Description text below title */
  description?: string | ReactNode;
  /** Header alignment when using kicker/title/description */
  align?: "left" | "center" | "right";
  /** Gap between section elements */
  gap?: number;
};

export const Section = forwardRef<HTMLElement, SectionProps>(
  function Section({ 
    background, 
    fullWidth = false, 
    noPadding = false, 
    border = false, 
    kicker,
    title,
    description,
    align = "left",
    gap = 6,
    className, 
    children, 
    ...props 
  }, ref) {
    const bgClasses: Record<string, string> = {
      white: "bg-surface-primary text-text-primary",
      black: "bg-surface-inverse text-text-inverse",
      grey: "bg-surface-secondary text-text-primary",
      ink: "bg-ink-950 text-ink-50",
    };

    const alignClasses = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    };

    const hasHeader = kicker || title || description;
    // Determine if dark context: explicit dark background, or border (assumes dark parent)
    const isDark = background === "ink" || background === "black" || (border && !background);

    // Render header content if kicker/title/description provided
    const headerContent = hasHeader ? (
      <div className={clsx("flex flex-col gap-spacing-3", alignClasses[align])}>
        {kicker && (
          <span className={clsx(
            "font-mono text-mono-xs uppercase tracking-kicker",
            isDark ? "text-ink-400" : "text-ink-500"
          )}>
            {kicker}
          </span>
        )}
        {title && (
          typeof title === "string" ? (
            <h2 className={clsx(
              "font-display text-h2-sm md:text-h2-md uppercase tracking-tight",
              isDark ? "text-white" : "text-black"
            )}>
              {title}
            </h2>
          ) : title
        )}
        {description && (
          typeof description === "string" ? (
            <p className={clsx(
              "font-body text-body-md",
              isDark ? "text-ink-300" : "text-ink-600",
              align === "center" ? "mx-auto max-w-2xl" : "max-w-3xl"
            )}>
              {description}
            </p>
          ) : description
        )}
      </div>
    ) : null;

    const content = (
      <div className={clsx("flex flex-col", `gap-spacing-${gap}`)}>
        {headerContent}
        {children}
      </div>
    );

    // Only apply background class if explicitly set (bordered sections inherit from parent)
    const bgClass = background ? bgClasses[background] : (!border ? bgClasses.white : undefined);

    return (
      <section
        ref={ref}
        className={clsx(
          bgClass,
          !noPadding && !border && "py-spacing-16 md:py-spacing-24",
          border && "border border-ink-800 p-spacing-6",
          className
        )}
        {...props}
      >
        {fullWidth || border ? content : <div className="container mx-auto px-spacing-4">{content}</div>}
      </section>
    );
  }
);

type GridGap = number | "sm" | "md" | "lg" | "xl";

export const Grid = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { cols?: 1 | 2 | 3 | 4 | 6 | 12; columns?: 1 | 2 | 3 | 4 | 6 | 12; gap?: GridGap }>(
  function Grid({ cols, columns, gap = 6, className, children, ...props }, ref) {
    const colCount = cols ?? columns ?? 1;
    const colClasses = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
      6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
      12: "grid-cols-4 md:grid-cols-6 lg:grid-cols-12",
    };

    const gapClasses: Record<string, string> = {
      sm: "gap-spacing-2",
      md: "gap-spacing-4",
      lg: "gap-spacing-6",
      xl: "gap-spacing-8",
    };

    const gapClass = typeof gap === "string" ? gapClasses[gap] : `gap-spacing-${gap}`;

    return (
      <div
        ref={ref}
        className={clsx("grid", colClasses[colCount], gapClass, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export const Stack = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { direction?: "vertical" | "horizontal"; gap?: number }>(
  function Stack({ direction = "vertical", gap = 4, className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(
          "flex",
          direction === "vertical" ? "flex-col" : "flex-row",
          `gap-spacing-${gap}`,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
