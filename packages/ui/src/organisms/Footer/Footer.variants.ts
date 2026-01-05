import { cva } from "class-variance-authority";

/**
 * Footer variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Substantial 4px top border for maximum impact
 * - Bold section headers
 * - Generous spacing
 */
export const footerVariants = cva(
  [
    // Base styles
    "border-t-4",
    "py-8",
    "sm:py-12",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Footer variant
       */
      variant: {
        default: "",
        minimal: "py-4 sm:py-6",
        expanded: "py-12 sm:py-16",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-surface-inverse text-text-inverse border-border-inverse",
        false: "bg-surface-primary text-text-primary border-border",
      },
    },
    defaultVariants: {
      variant: "default",
      inverted: true,
    },
    
    compoundVariants: [
      {
        variant: "default",
        inverted: true,
        class: "py-8 sm:py-12 bg-surface-inverse text-text-inverse border-border-inverse",
      },
      {
        variant: "default",
        inverted: false,
        class: "py-8 sm:py-12 bg-surface-primary text-text-primary border-border",
      },
      {
        variant: "minimal",
        inverted: true,
        class: "py-4 sm:py-6 bg-surface-inverse text-text-inverse border-border-inverse",
      },
      {
        variant: "minimal",
        inverted: false,
        class: "py-4 sm:py-6 bg-surface-primary text-text-primary border-border",
      },
      {
        variant: "expanded",
        inverted: true,
        class: "py-12 sm:py-16 bg-surface-inverse text-text-inverse border-border-inverse",
      },
      {
        variant: "expanded",
        inverted: false,
        class: "py-12 sm:py-16 bg-surface-primary text-text-primary border-border",
      },
    ],
  }
);

/**
 * Footer section variants using CVA (Class Variance Authority)
 */
export const footerSectionVariants = cva(
  [
    // Base styles
    "space-y-4",
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
 * Footer section title variants using CVA (Class Variance Authority)
 */
export const footerSectionTitleVariants = cva(
  [
    // Base styles
    "font-bold",
    "text-sm",
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
 * Footer copyright variants using CVA (Class Variance Authority)
 */
export const footerCopyrightVariants = cva(
  [
    // Base styles
    "pt-8",
    "border-t-2",
    "font-mono",
    "text-xs",
    "uppercase",
    "tracking-widest",
    "font-bold",
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
        true: "border-border-inverse text-text-tertiary-inverse",
        false: "border-border text-text-muted",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);
