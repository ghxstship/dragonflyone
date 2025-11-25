import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

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
        className={clsx("mx-auto px-4", sizeClasses[size], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export type SectionProps = HTMLAttributes<HTMLElement> & {
  background?: "white" | "black" | "grey" | "ink";
  fullWidth?: boolean;
  noPadding?: boolean;
  border?: boolean;
};

export const Section = forwardRef<HTMLElement, SectionProps>(
  function Section({ background = "white", fullWidth = false, noPadding = false, border = false, className, children, ...props }, ref) {
    const bgClasses = {
      white: "bg-white text-black",
      black: "bg-black text-white",
      grey: "bg-grey-100 text-black",
      ink: "bg-ink-950 text-ink-50",
    };

    return (
      <section
        ref={ref}
        className={clsx(
          bgClasses[background],
          !noPadding && "py-16 md:py-24",
          border && "border border-ink-800 p-6",
          className
        )}
        {...props}
      >
        {fullWidth ? children : <div className="container mx-auto px-4">{children}</div>}
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
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    };

    const gapClass = typeof gap === "string" ? gapClasses[gap] : `gap-${gap}`;

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
          `gap-${gap}`,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
