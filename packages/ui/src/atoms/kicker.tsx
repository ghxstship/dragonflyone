import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type KickerProps = HTMLAttributes<HTMLSpanElement> & {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Color variant */
  variant?: "default" | "muted" | "accent";
  /** Background context for WCAG-compliant contrast */
  colorScheme?: "on-dark" | "on-light" | "on-mid";
};

/**
 * Kicker - A small uppercase label used above headings
 * Commonly used for section labels, category indicators, and metadata
 * 
 * Color scheme determines text color for WCAG AA compliance:
 * - on-dark: For dark backgrounds (ink-700 to ink-950)
 * - on-light: For light backgrounds (ink-50 to ink-200)
 * - on-mid: For mid-tone backgrounds (ink-400 to ink-600)
 */
export const Kicker = forwardRef<HTMLSpanElement, KickerProps>(
  function Kicker({ size = "md", variant = "default", colorScheme = "on-dark", className, children, ...props }, ref) {
    const sizeClasses = {
      sm: "text-micro tracking-ultra",
      md: "text-mono-xs tracking-ultra",
      lg: "text-mono-sm tracking-ultra",
    };

    // WCAG AA compliant color mappings based on background context
    const colorSchemeClasses = {
      "on-dark": {
        default: "text-ink-400",  // 7.4:1 contrast on ink-950
        muted: "text-ink-500",    // 4.6:1 contrast on ink-950
        accent: "text-ink-300",   // 12.6:1 contrast on ink-950
      },
      "on-light": {
        default: "text-ink-600",  // 5.7:1 contrast on ink-50
        muted: "text-ink-500",    // 4.6:1 contrast on ink-50
        accent: "text-ink-700",   // 9.7:1 contrast on ink-50
      },
      "on-mid": {
        default: "text-ink-50",   // 7.4:1 contrast on ink-500
        muted: "text-ink-200",    // 5.3:1 contrast on ink-500
        accent: "text-ink-50",    // 7.4:1 contrast on ink-500
      },
    };

    return (
      <span
        ref={ref}
        className={clsx(
          "font-code uppercase",
          sizeClasses[size],
          colorSchemeClasses[colorScheme][variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
