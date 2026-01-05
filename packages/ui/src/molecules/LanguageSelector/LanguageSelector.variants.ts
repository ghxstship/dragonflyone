import { cva } from "class-variance-authority";

/**
 * LanguageSelector variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Interactive dropdown
 */
export const languageSelectorVariants = cva(
  [
    // Base styles
    "relative",
    "inline-flex",
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
    "cursor-pointer",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
    "focus:ring-[var(--color-brand-primary)]",
  ],
  {
    variants: {
      /**
       * Selector variant
       */
      variant: {
        default: "bg-surface-elevated border-border text-text-primary hover:bg-surface-hover hover:border-brand-primary",
        compact: "bg-surface-elevated border-border text-text-primary hover:bg-surface-hover hover:border-brand-primary px-3 py-1.5",
        minimal: "bg-transparent border-transparent text-text-secondary hover:text-text-primary px-2 py-1",
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
      
      // Compact variant combinations
      {
        variant: "compact",
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse text-text-inverse hover:bg-surface-hover-inverse hover:border-brand-primary px-3 py-1.5",
      },
      {
        variant: "compact",
        inverted: false,
        class: "bg-surface-elevated border-border text-text-primary hover:bg-surface-hover hover:border-brand-primary px-3 py-1.5",
      },
      
      // Minimal variant combinations
      {
        variant: "minimal",
        inverted: true,
        class: "bg-transparent border-transparent text-text-secondary-inverse hover:text-text-inverse px-2 py-1",
      },
      {
        variant: "minimal",
        inverted: false,
        class: "bg-transparent border-transparent text-text-secondary hover:text-text-primary px-2 py-1",
      },
    ],
  }
);

/**
 * LanguageSelector dropdown variants using CVA (Class Variance Authority)
 */
export const languageSelectorDropdownVariants = cva(
  [
    // Base styles
    "absolute",
    "top-full",
    "left-0",
    "mt-1",
    "w-full",
    "border-2",
    "rounded-[var(--radius-card)]",
    "shadow-hard-lg",
    "z-dropdown",
    "overflow-hidden",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Open state
       */
      isOpen: {
        true: "opacity-100 translate-y-0 pointer-events-auto",
        false: "opacity-0 -translate-y-2 pointer-events-none",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-surface-elevated-inverse border-border-inverse",
        false: "bg-surface-elevated border-border",
      },
    },
    defaultVariants: {
      isOpen: false,
      inverted: false,
    },
  }
);

/**
 * LanguageSelector option variants using CVA (Class Variance Authority)
 */
export const languageSelectorOptionVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-3",
    "px-4",
    "py-3",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "cursor-pointer",
  ],
  {
    variants: {
      /**
       * Selected state
       */
      selected: {
        true: "bg-brand-primary/10 text-brand-primary border-l-4 border-brand-primary",
        false: "",
      },
      
      /**
       * Hover state
       */
      hover: {
        true: "hover:bg-surface-hover",
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
      selected: false,
      hover: true,
      inverted: false,
    },
    
    compoundVariants: [
      // Selected state combinations
      {
        selected: true,
        inverted: true,
        class: "bg-brand-primary/20 text-brand-primary border-l-4 border-brand-primary",
      },
      {
        selected: true,
        inverted: false,
        class: "bg-brand-primary/10 text-brand-primary border-l-4 border-brand-primary",
      },
      
      // Unselected hover combinations
      {
        selected: false,
        hover: true,
        inverted: true,
        class: "hover:bg-surface-hover-inverse",
      },
      {
        selected: false,
        hover: true,
        inverted: false,
        class: "hover:bg-surface-hover",
      },
    ],
  }
);
