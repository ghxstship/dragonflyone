import { cva } from "class-variance-authority";

/**
 * Breadcrumb container variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 */
export const breadcrumbVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-gap-xs",
    "text-body-sm",
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
      inverted: true,
    },
  }
);

/**
 * Breadcrumb item variants using CVA (Class Variance Authority)
 */
export const breadcrumbItemVariants = cva(
  [
    // Base styles
    "font-body",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Active state
       */
      active: {
        true: "text-text-primary font-semibold",
        false: "text-text-muted hover:text-text-primary",
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
      inverted: true,
    },
    
    compoundVariants: [
      {
        active: true,
        inverted: true,
        class: "text-text-primary font-semibold",
      },
      {
        active: false,
        inverted: true,
        class: "text-text-muted hover:text-text-primary",
      },
      {
        active: true,
        inverted: false,
        class: "text-text-primary font-semibold",
      },
      {
        active: false,
        inverted: false,
        class: "text-text-muted hover:text-text-primary",
      },
    ],
  }
);
