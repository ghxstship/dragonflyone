import { cva } from "class-variance-authority";

/**
 * BulkActionBar variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Floating positioning support
 */
export const bulkActionBarVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-between",
    "gap-4",
    "p-4",
    "border-2",
    "rounded-[var(--radius-card)]",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Position of the bar
       */
      position: {
        top: "sticky top-0 z-dropdown",
        bottom: "sticky bottom-0 z-dropdown",
        floating: "fixed bottom-8 left-1/2 -translate-x-1/2 z-fixed shadow-hard-lg",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-surface-inverse border-border-inverse text-text-inverse",
        false: "bg-surface-primary border-border text-text-primary",
      },
    },
    defaultVariants: {
      position: "bottom",
      inverted: false,
    },
    
    compoundVariants: [
      {
        position: "top",
        inverted: true,
        class: "sticky top-0 z-dropdown bg-surface-inverse border-border-inverse text-text-inverse",
      },
      {
        position: "top",
        inverted: false,
        class: "sticky top-0 z-dropdown bg-surface-primary border-border text-text-primary",
      },
      {
        position: "bottom",
        inverted: true,
        class: "sticky bottom-0 z-dropdown bg-surface-inverse border-border-inverse text-text-inverse",
      },
      {
        position: "bottom",
        inverted: false,
        class: "sticky bottom-0 z-dropdown bg-surface-primary border-border text-text-primary",
      },
      {
        position: "floating",
        inverted: true,
        class: "fixed bottom-8 left-1/2 -translate-x-1/2 z-fixed shadow-hard-lg bg-surface-inverse border-border-inverse text-text-inverse",
      },
      {
        position: "floating",
        inverted: false,
        class: "fixed bottom-8 left-1/2 -translate-x-1/2 z-fixed shadow-hard-lg bg-surface-primary border-border text-text-primary",
      },
    ],
  }
);

/**
 * BulkActionBar action button variants using CVA (Class Variance Authority)
 */
export const bulkActionBarActionVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-2",
    "px-4",
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
       * Action variant
       */
      variant: {
        default: "bg-surface-elevated border-border text-text-primary hover:bg-surface-hover hover:border-brand-primary",
        danger: "bg-error-50 border-error-500 text-error-900 hover:bg-error-100 hover:border-error-600",
        primary: "bg-brand-primary border-brand-primary text-white hover:bg-brand-primary-hover shadow-primary",
      },
      
      /**
       * Disabled state
       */
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "cursor-pointer",
      },
      
      /**
       * Loading state
       */
      loading: {
        true: "opacity-75 cursor-wait",
        false: "",
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
      disabled: false,
      loading: false,
      inverted: false,
    },
    
    compoundVariants: [
      // Default variant combinations
      {
        variant: "default",
        disabled: false,
        loading: false,
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse text-text-inverse hover:bg-surface-hover-inverse hover:border-brand-primary cursor-pointer",
      },
      {
        variant: "default",
        disabled: false,
        loading: false,
        inverted: false,
        class: "bg-surface-elevated border-border text-text-primary hover:bg-surface-hover hover:border-brand-primary cursor-pointer",
      },
      
      // Danger variant combinations
      {
        variant: "danger",
        disabled: false,
        loading: false,
        inverted: true,
        class: "bg-error-900/20 border-error-400 text-error-100 hover:bg-error-900/30 hover:border-error-300 cursor-pointer",
      },
      {
        variant: "danger",
        disabled: false,
        loading: false,
        inverted: false,
        class: "bg-error-50 border-error-500 text-error-900 hover:bg-error-100 hover:border-error-600 cursor-pointer",
      },
      
      // Primary variant combinations
      {
        variant: "primary",
        disabled: false,
        loading: false,
        inverted: true,
        class: "bg-brand-primary border-brand-primary text-white hover:bg-brand-primary-hover shadow-primary cursor-pointer",
      },
      {
        variant: "primary",
        disabled: false,
        loading: false,
        inverted: false,
        class: "bg-brand-primary border-brand-primary text-white hover:bg-brand-primary-hover shadow-primary cursor-pointer",
      },
    ],
  }
);
