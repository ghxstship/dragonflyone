import { cva } from "class-variance-authority";

/**
 * Skeleton variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Skeleton loading states
 */
export const skeletonVariants = cva(
  [
    // Base styles
    "animate-pulse",
    "rounded-badge",
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
        true: "bg-surface-elevated-inverse",
        false: "bg-surface-elevated",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * SkeletonCard variants using CVA (Class Variance Authority)
 */
export const skeletonCardVariants = cva(
  [
    // Base styles
    "border-2",
    "p-4",
    "rounded-[var(--radius-card)]",
    "shadow-hard",
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
        true: "bg-surface-primary-inverse border-border-inverse",
        false: "bg-surface-primary border-border",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * SkeletonTable variants using CVA (Class Variance Authority)
 */
export const skeletonTableVariants = cva(
  [
    // Base styles
    "border-2",
    "rounded-[var(--radius-card)]",
    "shadow-hard",
    "overflow-hidden",
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
        true: "bg-surface-primary-inverse border-border-inverse",
        false: "bg-surface-primary border-border",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * SkeletonTable header variants using CVA (Class Variance Authority)
 */
export const skeletonTableHeaderVariants = cva(
  [
    // Base styles
    "border-b-2",
    "p-4",
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
        true: "border-border-inverse",
        false: "border-border",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * SkeletonTable row variants using CVA (Class Variance Authority)
 */
export const skeletonTableRowVariants = cva(
  [
    // Base styles
    "border-b-2",
    "p-4",
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
        true: "border-border-inverse",
        false: "border-border",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * SkeletonTable row content variants using CVA (Class Variance Authority)
 */
export const skeletonTableRowContentVariants = cva(
  [
    // Base styles
    "flex",
    "gap-4",
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
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);
