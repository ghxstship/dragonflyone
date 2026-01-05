import { cva } from "class-variance-authority";

/**
 * ServiceCard variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Service card with icon, title, and description
 */
export const serviceCardVariants = cva(
  [
    // Base styles
    "p-6",
    "border-2",
    "rounded-[var(--radius-card)]",
    "shadow-hard",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "hover:scale-105",
    "hover:shadow-hard",
    "group",
  ],
  {
    variants: {
      /**
       * Background variant
       */
      background: {
        default: "",
        inverted: "",
        muted: "",
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
      background: "default",
      inverted: false,
    },
    
    compoundVariants: [
      // Background variant combinations
      {
        background: "default",
        inverted: true,
        class: "bg-surface-primary-inverse border-border-inverse text-text-primary-inverse",
      },
      {
        background: "default",
        inverted: false,
        class: "bg-surface-primary border-border text-text-primary",
      },
      
      {
        background: "inverted",
        inverted: true,
        class: "bg-surface-primary-inverse border-border-inverse text-text-primary-inverse",
      },
      {
        background: "inverted",
        inverted: false,
        class: "bg-surface-primary-inverse border-border-inverse text-text-primary-inverse",
      },
      
      {
        background: "muted",
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse text-text-primary-inverse",
      },
      {
        background: "muted",
        inverted: false,
        class: "bg-surface-elevated border-border text-text-primary",
      },
    ],
  }
);

/**
 * ServiceCard icon container variants using CVA (Class Variance Authority)
 */
export const serviceCardIconContainerVariants = cva(
  [
    // Base styles
    "mb-4",
    "flex",
    "items-center",
    "justify-center",
    "w-16",
    "h-16",
    "rounded",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Background variant
       */
      background: {
        default: "bg-brand-primary/10",
        inverted: "bg-brand-primary/20",
        muted: "bg-surface-elevated",
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
      background: "default",
      inverted: false,
    },
  }
);

/**
 * ServiceCard icon variants using CVA (Class Variance Authority)
 */
export const serviceCardIconVariants = cva(
  [
    // Base styles
    "text-2xl",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Background variant
       */
      background: {
        default: "text-brand-primary",
        inverted: "text-brand-primary",
        muted: "text-text-secondary",
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
      background: "default",
      inverted: false,
    },
  }
);

/**
 * ServiceCard title variants using CVA (Class Variance Authority)
 */
export const serviceCardTitleVariants = cva(
  [
    // Base styles
    "font-bold",
    "text-lg",
    "uppercase",
    "tracking-wider",
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
 * ServiceCard description variants using CVA (Class Variance Authority)
 */
export const serviceCardDescriptionVariants = cva(
  [
    // Base styles
    "text-sm",
    "leading-relaxed",
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
