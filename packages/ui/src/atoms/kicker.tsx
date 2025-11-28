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
 * Kicker component - Bold Contemporary Pop Art Adventure
 * 
 * A small uppercase label used above headings.
 * Features bold typography and clear visual hierarchy.
 * 
 * Color scheme determines text color for WCAG AA compliance:
 * - on-dark: For dark backgrounds (ink-700 to ink-950)
 * - on-light: For light backgrounds (ink-50 to ink-200)
 * - on-mid: For mid-tone backgrounds (ink-400 to ink-600)
 */
export const Kicker = forwardRef<HTMLSpanElement, KickerProps>(
  function Kicker({ size = "md", variant = "default", colorScheme = "on-dark", className, children, ...props }, ref) {
    const sizeClasses = {
      sm: "text-[10px] tracking-[0.2em]",
      md: "text-xs tracking-[0.15em]",
      lg: "text-sm tracking-[0.1em]",
    };

    // WCAG AA compliant color mappings based on background context
    const colorSchemeClasses = {
      "on-dark": {
        default: "text-grey-400",
        muted: "text-grey-500",
        accent: "text-grey-300",
      },
      "on-light": {
        default: "text-grey-600",
        muted: "text-grey-500",
        accent: "text-grey-700",
      },
      "on-mid": {
        default: "text-white",
        muted: "text-grey-200",
        accent: "text-white",
      },
    };

    return (
      <span
        ref={ref}
        className={clsx(
          "font-code uppercase font-bold",
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
