import { cva } from "class-variance-authority";

/**
 * EmptyState variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold 2px dashed border (comic panel style)
 * - Generous padding
 * - Clear visual hierarchy
 */
export const emptyStateVariants = cva(
  [
    // Base styles
    "flex",
    "flex-col",
    "items-center",
    "justify-center",
    "p-16",
    "text-center",
    "border-2",
    "border-dashed",
    "rounded-[var(--radius-card)]",
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
        true: "border-border bg-surface-inverse/50",
        false: "border-border bg-muted",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * EmptyState icon variants using CVA (Class Variance Authority)
 */
export const emptyStateIconVariants = cva(
  [
    // Base styles
    "mb-6",
    "text-4xl",
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
        true: "text-text-muted",
        false: "text-text-muted",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * EmptyState title variants using CVA (Class Variance Authority)
 */
export const emptyStateTitleVariants = cva(
  [
    // Base styles
    "uppercase",
    "tracking-wider",
    "font-bold",
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
        true: "text-text-primary",
        false: "text-text-primary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * EmptyState description variants using CVA (Class Variance Authority)
 */
export const emptyStateDescriptionVariants = cva(
  [
    // Base styles
    "mt-2",
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
        true: "text-text-muted",
        false: "text-text-muted",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * EmptyState suggestions variants using CVA (Class Variance Authority)
 */
export const emptyStateSuggestionsVariants = cva(
  [
    // Base styles
    "mt-4",
    "text-sm",
    "font-body",
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
        true: "text-text-tertiary",
        false: "text-text-tertiary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);
