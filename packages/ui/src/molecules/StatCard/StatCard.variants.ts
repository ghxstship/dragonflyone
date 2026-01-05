import { cva } from "class-variance-authority";

/**
 * StatCard variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Stat card with value, label, and trend
 */
export const statCardVariants = cva(
  [
    // Base styles
    "border-2",
    "p-4",
    "flex",
    "flex-col",
    "gap-3",
    "rounded-[var(--radius-card)]",
    "shadow-hard",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "hover:scale-105",
    "hover:shadow-hard",
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
 * StatCard icon container variants using CVA (Class Variance Authority)
 */
export const statCardIconContainerVariants = cva(
  [
    // Base styles
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
        true: "text-text-muted-inverse",
        false: "text-text-muted",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * StatCard value variants using CVA (Class Variance Authority)
 */
export const statCardValueVariants = cva(
  [
    // Base styles
    "font-bold",
    "text-2xl",
    "sm:text-4xl",
    "md:text-5xl",
    "leading-none",
    "uppercase",
    "tracking-tight",
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
        true: "text-text-primary-inverse",
        false: "text-text-primary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * StatCard label variants using CVA (Class Variance Authority)
 */
export const statCardLabelVariants = cva(
  [
    // Base styles
    "text-sm",
    "font-medium",
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
        true: "text-text-secondary-inverse",
        false: "text-text-secondary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * StatCard trend container variants using CVA (Class Variance Authority)
 */
export const statCardTrendContainerVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-1",
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

/**
 * StatCard trend variants using CVA (Class Variance Authority)
 */
export const statCardTrendVariants = cva(
  [
    // Base styles
    "text-xs",
    "font-medium",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Trend direction
       */
      trend: {
        up: "text-success-600",
        down: "text-error-600",
        neutral: "text-text-muted",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      trend: "neutral",
      inverted: false,
    },
    
    compoundVariants: [
      // Trend with inversion combinations
      {
        trend: "up",
        inverted: true,
        class: "text-success-600",
      },
      {
        trend: "down",
        inverted: true,
        class: "text-error-600",
      },
      {
        trend: "neutral",
        inverted: true,
        class: "text-text-muted-inverse",
      },
    ],
  }
);
