import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type KickerProps = HTMLAttributes<HTMLSpanElement> & {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Color variant */
  variant?: "default" | "muted" | "accent";
};

/**
 * Kicker - A small uppercase label used above headings
 * Commonly used for section labels, category indicators, and metadata
 */
export const Kicker = forwardRef<HTMLSpanElement, KickerProps>(
  function Kicker({ size = "md", variant = "default", className, children, ...props }, ref) {
    const sizeClasses = {
      sm: "text-[0.625rem] tracking-[0.35em]",
      md: "text-xs tracking-[0.4em]",
      lg: "text-sm tracking-[0.4em]",
    };

    const variantClasses = {
      default: "text-ink-500",
      muted: "text-ink-400",
      accent: "text-ink-300",
    };

    return (
      <span
        ref={ref}
        className={clsx(
          "font-code uppercase",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
