import { cva } from "class-variance-authority";

/**
 * Pagination container variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders on interactive elements
 * - Clear visual hierarchy
 * - Accessible navigation
 */
export const paginationVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-center",
    "gap-2",
    "font-body",
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
 * Pagination item variants using CVA (Class Variance Authority)
 */
export const paginationItemVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-center",
    "w-10",
    "h-10",
    "border-2",
    "rounded-button",
    "font-medium",
    "text-sm",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
    "focus:ring-[var(--color-brand-primary)]",
  ],
  {
    variants: {
      /**
       * Active state
       */
      active: {
        true: "bg-brand-primary border-brand-primary text-white shadow-primary",
        false: "bg-surface-primary border-border text-text-primary hover:bg-surface-elevated hover:border-brand-primary",
      },
      
      /**
       * Disabled state
       */
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "cursor-pointer",
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
      active: false,
      disabled: false,
      inverted: false,
    },
    
    compoundVariants: [
      {
        active: true,
        disabled: false,
        inverted: true,
        class: "bg-brand-primary border-brand-primary text-white shadow-primary cursor-pointer",
      },
      {
        active: false,
        disabled: false,
        inverted: true,
        class: "bg-surface-primary border-border text-text-primary hover:bg-surface-elevated hover:border-brand-primary cursor-pointer",
      },
      {
        active: false,
        disabled: true,
        inverted: true,
        class: "opacity-50 cursor-not-allowed",
      },
      {
        active: true,
        disabled: false,
        inverted: false,
        class: "bg-brand-primary border-brand-primary text-white shadow-primary cursor-pointer",
      },
      {
        active: false,
        disabled: false,
        inverted: false,
        class: "bg-surface-primary border-border text-text-primary hover:bg-surface-elevated hover:border-brand-primary cursor-pointer",
      },
      {
        active: false,
        disabled: true,
        inverted: false,
        class: "opacity-50 cursor-not-allowed",
      },
    ],
  }
);

/**
 * Pagination dots variants using CVA (Class Variance Authority)
 */
export const paginationDotsVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-center",
    "w-10",
    "h-10",
    "text-text-muted",
    "font-body",
    "text-sm",
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
