import { cva } from "class-variance-authority";

/**
 * ErrorBoundary container variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders for error states
 * - Clear visual hierarchy
 * - Comic panel style for error display
 */
export const errorBoundaryVariants = cva(
  [
    // Base styles
    "flex",
    "flex-col",
    "items-center",
    "justify-center",
    "min-h-[400px]",
    "p-8",
    "text-center",
    "border-2",
    "border-dashed",
    "rounded-[var(--radius-modal)]",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-error-900/10 border-error-400 text-error-100",
        false: "bg-error-50 border-error-500 text-error-900",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * ErrorBoundary title variants using CVA (Class Variance Authority)
 */
export const errorBoundaryTitleVariants = cva(
  [
    // Base styles
    "text-2xl",
    "font-bold",
    "uppercase",
    "tracking-wider",
    "mb-4",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "text-error-100",
        false: "text-error-900",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * ErrorBoundary description variants using CVA (Class Variance Authority)
 */
export const errorBoundaryDescriptionVariants = cva(
  [
    // Base styles
    "mb-6",
    "max-w-md",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "text-error-200",
        false: "text-error-700",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * ErrorBoundary details variants using CVA (Class Variance Authority)
 */
export const errorBoundaryDetailsVariants = cva(
  [
    // Base styles
    "mt-4",
    "p-4",
    "bg-black/10",
    "border",
    "border-black/20",
    "rounded-[var(--radius-card)]",
    "font-mono",
    "text-xs",
    "text-left",
    "max-h-32",
    "overflow-y-auto",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-white/5 border-white/10 text-error-200",
        false: "bg-black/5 border-black/10 text-error-800",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);
