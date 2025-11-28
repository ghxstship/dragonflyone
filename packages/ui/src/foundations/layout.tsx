import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

/**
 * Container component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Proper max-widths for content containment
 * - Generous horizontal padding
 */
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
        className={clsx("mx-auto px-4 sm:px-6 lg:px-8", sizeClasses[size], className)}
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

/**
 * Section component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Generous vertical spacing (64px/96px)
 * - Bold 2px borders when bordered
 * - Clear visual hierarchy
 */
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
      white: "bg-ink-50 text-ink-950",
      black: "bg-ink-950 text-ink-50",
      grey: "bg-ink-100 text-ink-950",
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
      <div className={clsx("flex flex-col gap-3", alignClasses[align])}>
        {kicker && (
          <span className={clsx(
            "font-mono text-xs uppercase tracking-widest font-bold",
            isDark ? "text-grey-400" : "text-grey-500"
          )}>
            {kicker}
          </span>
        )}
        {title && (
          typeof title === "string" ? (
            <h2 className={clsx(
              "font-display text-2xl md:text-4xl uppercase tracking-tight font-bold",
              isDark ? "text-white" : "text-black"
            )}>
              {title}
            </h2>
          ) : title
        )}
        {description && (
          typeof description === "string" ? (
            <p className={clsx(
              "font-body text-base md:text-lg",
              isDark ? "text-grey-300" : "text-grey-600",
              align === "center" ? "mx-auto max-w-2xl" : "max-w-3xl"
            )}>
              {description}
            </p>
          ) : description
        )}
      </div>
    ) : null;

    const gapClasses: Record<number, string> = {
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
      6: "gap-6",
      8: "gap-8",
      10: "gap-10",
      12: "gap-12",
    };

    const content = (
      <div className={clsx("flex flex-col", gapClasses[gap] || "gap-6")}>
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
          !noPadding && !border && "py-16 md:py-24",
          border && "border-2 border-grey-800 p-6 rounded-[var(--radius-card)]",
          className
        )}
        {...props}
      >
        {fullWidth || border ? content : <div className="container mx-auto px-4 sm:px-6 lg:px-8">{content}</div>}
      </section>
    );
  }
);

type GridGap = number | "sm" | "md" | "lg" | "xl";

/**
 * Grid component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Responsive column layouts
 * - Consistent gap spacing
 */
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

    const gapClasses: Record<string | number, string> = {
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
      6: "gap-6",
      8: "gap-8",
      10: "gap-10",
      12: "gap-12",
    };

    const gapClass = gapClasses[gap] || "gap-6";

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

/**
 * Stack component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Flexible vertical/horizontal stacking
 * - Consistent gap spacing
 */
export const Stack = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { direction?: "vertical" | "horizontal"; gap?: number }>(
  function Stack({ direction = "vertical", gap = 4, className, children, ...props }, ref) {
    const gapClasses: Record<number, string> = {
      1: "gap-1",
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
      5: "gap-5",
      6: "gap-6",
      8: "gap-8",
      10: "gap-10",
      12: "gap-12",
    };

    return (
      <div
        ref={ref}
        className={clsx(
          "flex",
          direction === "vertical" ? "flex-col" : "flex-row",
          gapClasses[gap] || "gap-4",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
