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
      sm: "text-micro tracking-ultra",
      md: "text-mono-xs tracking-ultra",
      lg: "text-mono-sm tracking-ultra",
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
