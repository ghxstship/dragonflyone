import { cva } from "class-variance-authority";

/**
 * ListPageToolbar variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Interactive elements
 */
export const listPageToolbarVariants = cva(
  [
    // Base styles
    "flex",
    "flex-col",
    "gap-4",
    "p-4",
    "border-b-2",
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
        true: "bg-surface-inverse border-border-inverse",
        false: "bg-surface-primary border-border",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * ListPageToolbar header variants using CVA (Class Variance Authority)
 */
export const listPageToolbarHeaderVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-between",
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

/**
 * ListPageToolbar title variants using CVA (Class Variance Authority)
 */
export const listPageToolbarTitleVariants = cva(
  [
    // Base styles
    "text-xl",
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
 * ListPageToolbar actions variants using CVA (Class Variance Authority)
 */
export const listPageToolbarActionsVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-2",
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
 * ListPageToolbar search variants using CVA (Class Variance Authority)
 */
export const listPageToolbarSearchVariants = cva(
  [
    // Base styles
    "flex",
    "flex-1",
    "max-w-md",
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
 * ListPageToolbar controls variants using CVA (Class Variance Authority)
 */
export const listPageToolbarControlsVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-between",
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

/**
 * ListPageToolbar button variants using CVA (Class Variance Authority)
 */
export const listPageToolbarButtonVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-2",
    "px-3",
    "py-2",
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
       * Button variant
       */
      variant: {
        default: "bg-surface-elevated border-border text-text-primary hover:bg-surface-hover hover:border-brand-primary",
        primary: "bg-brand-primary border-brand-primary text-white hover:bg-brand-primary-hover shadow-primary",
        ghost: "bg-transparent border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover",
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
      variant: "default",
      inverted: false,
    },
    
    compoundVariants: [
      // Default variant combinations
      {
        variant: "default",
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse text-text-inverse hover:bg-surface-hover-inverse hover:border-brand-primary",
      },
      {
        variant: "default",
        inverted: false,
        class: "bg-surface-elevated border-border text-text-primary hover:bg-surface-hover hover:border-brand-primary",
      },
      
      // Primary variant combinations
      {
        variant: "primary",
        inverted: true,
        class: "bg-brand-primary border-brand-primary text-white hover:bg-brand-primary-hover shadow-primary",
      },
      {
        variant: "primary",
        inverted: false,
        class: "bg-brand-primary border-brand-primary text-white hover:bg-brand-primary-hover shadow-primary",
      },
      
      // Ghost variant combinations
      {
        variant: "ghost",
        inverted: true,
        class: "bg-transparent border-transparent text-text-secondary-inverse hover:text-text-inverse hover:bg-surface-hover-inverse",
      },
      {
        variant: "ghost",
        inverted: false,
        class: "bg-transparent border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover",
      },
    ],
  }
);
