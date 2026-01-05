import { cva } from "class-variance-authority";

/**
 * Dropdown container variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold 2px border
 * - Hard offset shadow
 * - Pop-in animation
 * - Clear item separation
 */
export const dropdownVariants = cva(
  [
    // Base styles
    "relative",
    "inline-block",
  ],
  {
    variants: {
      /**
       * Alignment
       */
      align: {
        left: "",
        right: "",
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
      align: "left",
      inverted: true,
    },
  }
);

/**
 * Dropdown menu variants using CVA (Class Variance Authority)
 */
export const dropdownMenuVariants = cva(
  [
    // Base styles
    "absolute",
    "z-50",
    "border-2",
    "rounded-[var(--radius-card)]",
    "shadow-lg",
    "py-2",
    "min-w-[200px]",
    "bg-surface-primary",
    "border-[var(--color-border-input)]",
    "animate-pop-in",
    "transition-all duration-[var(--duration-fast)] ease-[var(--easing-easeOut)]",
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
      
      /**
       * Alignment
       */
      align: {
        left: "left-0",
        right: "right-0",
      },
    },
    defaultVariants: {
      inverted: true,
      align: "left",
    },
    
    compoundVariants: [
      {
        inverted: true,
        align: "left",
        class: "left-0",
      },
      {
        inverted: true,
        align: "right",
        class: "right-0",
      },
      {
        inverted: false,
        align: "left",
        class: "left-0",
      },
      {
        inverted: false,
        align: "right",
        class: "right-0",
      },
    ],
  }
);

/**
 * Dropdown item variants using CVA (Class Variance Authority)
 */
export const dropdownItemVariants = cva(
  [
    // Base styles
    "block",
    "w-full",
    "text-left",
    "px-4",
    "py-2",
    "text-sm",
    "font-body",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "border-b",
    "border-[var(--color-border-subtle)]",
    "last:border-b-0",
  ],
  {
    variants: {
      /**
       * Disabled state
       */
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "cursor-pointer hover:bg-[var(--color-surface-elevated)]",
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
      disabled: false,
      inverted: true,
    },
    
    compoundVariants: [
      {
        disabled: false,
        inverted: true,
        class: "cursor-pointer hover:bg-[var(--color-surface-elevated)]",
      },
      {
        disabled: false,
        inverted: false,
        class: "cursor-pointer hover:bg-[var(--color-surface-elevated)]",
      },
      {
        disabled: true,
        inverted: true,
        class: "opacity-50 cursor-not-allowed",
      },
      {
        disabled: true,
        inverted: false,
        class: "opacity-50 cursor-not-allowed",
      },
    ],
  }
);
