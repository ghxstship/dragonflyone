import { cva } from "class-variance-authority";

/**
 * ProgressBar variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 */
export const progressBarTrackVariants = cva(
  [
    // Base track styles
    "border-2",
    "rounded-[var(--radius-circle)]",
    "relative",
    "overflow-hidden",
  ],
  {
    variants: {
      size: {
        sm: ["h-1.5 sm:h-2"],
        md: ["h-2 sm:h-3"],
        lg: ["h-3 sm:h-4"],
      },
      variant: {
        default: [
          "bg-[var(--color-surface-elevated)]",
          "border-[var(--color-border-input)]",
          "shadow-[var(--shadow-xs)]",
        ],
        inverse: [
          "bg-[var(--color-surface-elevated)]",
          "border-[var(--color-border-input)]",
          "shadow-[var(--shadow-xs)]",
        ],
        success: [
          "bg-[var(--color-success-900)]",
          "border-[var(--color-success-500)]",
          "shadow-[var(--shadow-xs)]",
        ],
        warning: [
          "bg-[var(--color-warning-900)]",
          "border-[var(--color-warning-500)]",
          "shadow-[var(--shadow-xs)]",
        ],
        error: [
          "bg-[var(--color-error-900)]",
          "border-[var(--color-error-500)]",
          "shadow-[var(--shadow-xs)]",
        ],
        info: [
          "bg-[var(--color-info-900)]",
          "border-[var(--color-info-500)]",
          "shadow-[var(--shadow-xs)]",
        ],
        pop: [
          "bg-[var(--color-surface-elevated)]",
          "border-[var(--color-brand-primary)]",
          "shadow-[var(--shadow-sm)]",
        ],
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

export const progressBarFillVariants = cva(
  [
    // Base fill styles
    "h-full",
    "rounded-[var(--radius-circle)]",
    "transition-all duration-200 ease-[var(--easing-bounce)]",
  ],
  {
    variants: {
      variant: {
        default: ["bg-[var(--color-surface-primary)]"],
        inverse: ["bg-[var(--color-surface-inverse)]"],
        success: ["bg-[var(--color-success-500)]"],
        warning: ["bg-[var(--color-warning-500)]"],
        error: ["bg-[var(--color-error-500)]"],
        info: ["bg-[var(--color-info-500)]"],
        pop: ["bg-[var(--color-surface-primary)]"],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const progressBarLabelVariants = cva(
  [
    // Base label styles
    "mt-1",
    "block",
    "font-code",
    "text-xs",
    "font-bold",
  ],
  {
    variants: {
      variant: {
        default: ["text-[var(--color-text-muted)]"],
        inverse: ["text-[var(--color-text-disabled)]"],
        success: ["text-[var(--color-success-700)]"],
        warning: ["text-[var(--color-warning-700)]"],
        error: ["text-[var(--color-error-700)]"],
        info: ["text-[var(--color-info-700)]"],
        pop: ["text-[var(--color-text-secondary)]"],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type ProgressBarTrackVariantProps = Parameters<typeof progressBarTrackVariants>[0];
export type ProgressBarFillVariantProps = Parameters<typeof progressBarFillVariants>[0];
export type ProgressBarLabelVariantProps = Parameters<typeof progressBarLabelVariants>[0];
