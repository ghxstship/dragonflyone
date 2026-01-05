import { cva } from "class-variance-authority";

/**
 * ContentCard variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Flexible padding options
 */
export const contentCardVariants = cva(
  [
    // Base styles
    "rounded-[var(--radius-card)]",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Card variant
       */
      variant: {
        bordered: "border-2 border-border bg-surface-primary shadow-hard",
        surface: "border-2 border-transparent bg-surface-elevated shadow-hard",
        ghost: "border-2 border-transparent bg-transparent",
      },
      
      /**
       * Padding size
       */
      padding: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
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
      variant: "bordered",
      padding: "md",
      inverted: false,
    },
    
    compoundVariants: [
      // Bordered variant combinations
      {
        variant: "bordered",
        inverted: true,
        class: "border-2 border-border-inverse bg-surface-inverse shadow-hard",
      },
      {
        variant: "bordered",
        inverted: false,
        class: "border-2 border-border bg-surface-primary shadow-hard",
      },
      
      // Surface variant combinations
      {
        variant: "surface",
        inverted: true,
        class: "border-2 border-transparent bg-surface-elevated-inverse shadow-hard",
      },
      {
        variant: "surface",
        inverted: false,
        class: "border-2 border-transparent bg-surface-elevated shadow-hard",
      },
      
      // Ghost variant combinations
      {
        variant: "ghost",
        inverted: true,
        class: "border-2 border-transparent bg-transparent",
      },
      {
        variant: "ghost",
        inverted: false,
        class: "border-2 border-transparent bg-transparent",
      },
    ],
  }
);

/**
 * ContentCard kicker variants using CVA (Class Variance Authority)
 */
export const contentCardKickerVariants = cva(
  [
    // Base styles
    "text-sm",
    "font-bold",
    "uppercase",
    "tracking-wider",
    "mb-2",
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
        true: "text-text-inverse",
        false: "text-text-muted",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * ContentCard title variants using CVA (Class Variance Authority)
 */
export const contentCardTitleVariants = cva(
  [
    // Base styles
    "text-xl",
    "font-bold",
    "mb-3",
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
        true: "text-text-inverse",
        false: "text-text-primary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * ContentCard description variants using CVA (Class Variance Authority)
 */
export const contentCardDescriptionVariants = cva(
  [
    // Base styles
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
 * ContentCard bullets variants using CVA (Class Variance Authority)
 */
export const contentCardBulletsVariants = cva(
  [
    // Base styles
    "space-y-2",
    "mb-4",
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
 * ContentCard bullet item variants using CVA (Class Variance Authority)
 */
export const contentCardBulletItemVariants = cva(
  [
    // Base styles
    "flex",
    "items-start",
    "gap-2",
    "text-sm",
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
