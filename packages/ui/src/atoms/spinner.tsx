import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type SpinnerProps = HTMLAttributes<HTMLDivElement> & {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "black" | "white" | "grey";
  /** Optional loading text displayed below the spinner */
  text?: string;
  /** Inverted theme (for dark backgrounds) - auto-selects appropriate variant */
  inverted?: boolean;
};

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  function Spinner({ size = "md", variant, text, inverted = false, className, ...props }, ref) {
    // Auto-select variant based on inverted prop if not explicitly set
    const effectiveVariant = variant ?? (inverted ? "white" : "black");
    const sizeClasses = {
      xs: "w-icon-xs h-icon-xs border-2",
      sm: "w-icon-sm h-icon-sm border-2",
      md: "w-icon-lg h-icon-lg border-2",
      lg: "w-icon-xl h-icon-xl border-3",
      xl: "w-icon-2xl h-icon-2xl border-3",
    };

    const variantClasses = {
      black: "border-black border-t-transparent",
      white: "border-white border-t-transparent",
      grey: "border-grey-400 border-t-transparent",
    };

    const gapClasses = {
      xs: "gap-gap-xs",
      sm: "gap-gap-sm",
      md: "gap-gap-md",
      lg: "gap-gap-lg",
      xl: "gap-gap-xl",
    };

    const textColorClasses = {
      black: "text-grey-600",
      white: "text-grey-300",
      grey: "text-grey-400",
    };

    const spinner = (
      <div
        className={clsx(
          "inline-block rounded-full animate-spin",
          sizeClasses[size],
          variantClasses[effectiveVariant]
        )}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    );

    if (!text) {
      return (
        <div ref={ref} className={className} {...props}>
          {spinner}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={clsx("flex flex-col items-center justify-center", gapClasses[size], className)}
        {...props}
      >
        {spinner}
        <p className={clsx("font-code text-mono-sm uppercase tracking-wider", textColorClasses[effectiveVariant])}>
          {text}
        </p>
      </div>
    );
  }
);
