import { cva } from "class-variance-authority";

/**
 * Spinner variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 */
export const spinnerVariants = cva(
  [
    // Base styles
    "inline-block",
    "rounded-[var(--radius-circle)]",
    "animate-spin",
  ],
  {
    variants: {
      size: {
        xs: [
          "w-3 h-3 sm:w-[var(--size-icon-xs)] sm:h-[var(--size-icon-xs)]",
          "border-2",
        ],
        sm: [
          "w-4 h-4 sm:w-[var(--size-icon-sm)] sm:h-[var(--size-icon-sm)]",
          "border-2",
        ],
        md: [
          "w-5 h-5 sm:w-[var(--size-icon-lg)] sm:h-[var(--size-icon-lg)]",
          "border-2",
        ],
        lg: [
          "w-6 h-6 sm:w-[var(--size-icon-xl)] sm:h-[var(--size-icon-xl)]",
          "border-2 sm:border-3",
        ],
        xl: [
          "w-8 h-8 sm:w-[var(--size-icon-2xl)] sm:h-[var(--size-icon-2xl)]",
          "border-2 sm:border-3",
        ],
      },
      variant: {
        black: [
          "border-[var(--color-text-primary)]",
          "border-t-transparent",
        ],
        white: [
          "border-[var(--color-text-inverted)]",
          "border-t-transparent",
        ],
        grey: [
          "border-[var(--color-border-input)]",
          "border-t-transparent",
        ],
      },
    },
    defaultVariants: {
      size: "md",
      variant: "black",
    },
  }
);

export const spinnerContainerVariants = cva(
  [
    // Base container styles
    "flex",
    "flex-col",
    "items-center",
    "justify-center",
  ],
  {
    variants: {
      size: {
        xs: ["gap-[var(--spacing-xs)]"],
        sm: ["gap-[var(--spacing-sm)]"],
        md: ["gap-[var(--spacing-md)]"],
        lg: ["gap-[var(--spacing-lg)]"],
        xl: ["gap-[var(--spacing-xl)]"],
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export const spinnerTextVariants = cva(
  [
    // Base text styles
    "font-code",
    "text-[var(--font-size-label-sm)]",
    "uppercase",
    "tracking-wider",
  ],
  {
    variants: {
      variant: {
        black: ["text-[var(--color-text-muted)]"],
        white: ["text-[var(--color-text-secondary)]"],
        grey: ["text-[var(--color-text-muted)]"],
      },
    },
    defaultVariants: {
      variant: "black",
    },
  }
);

export type SpinnerVariantProps = Parameters<typeof spinnerVariants>[0];
export type SpinnerContainerVariantProps = Parameters<typeof spinnerContainerVariants>[0];
export type SpinnerTextVariantProps = Parameters<typeof spinnerTextVariants>[0];
