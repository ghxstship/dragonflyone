import { cva } from "class-variance-authority";

/**
 * Tooltip variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 */
export const tooltipVariants = cva(
  [
    // Base styles
    "fixed",
    "z-tooltip",
    "font-code",
    "text-xs sm:text-sm",
    "tracking-wide",
    "font-medium",
    "px-2 py-1 sm:px-4 sm:py-2",
    "max-w-[200px] sm:max-w-xs",
    "pointer-events-none",
    "border-2",
    "rounded-[var(--radius-tooltip)]",
    "transition-all duration-[var(--duration-fast)] ease-[var(--easing-easeOut)]",
    // Speech bubble style with accent shadow
    "bg-[var(--color-surface-elevated)]",
    "text-[var(--color-text-primary)]",
    "border-[var(--color-border-default)]",
    "shadow-[var(--shadow-sm)]",
  ],
  {
    variants: {
      visible: {
        true: ["opacity-100 animate-[var(--animate-zoom-in)]"],
        false: ["opacity-0"],
      },
    },
    defaultVariants: {
      visible: false,
    },
  }
);

export type TooltipVariantProps = Parameters<typeof tooltipVariants>[0];
