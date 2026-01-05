import { cva } from "class-variance-authority";

/**
 * Tabs variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Tabs with various styling variants
 */
export const tabsVariants = cva(
  [
    // Base styles
    "w-full",
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
 * TabsList variants using CVA (Class Variance Authority)
 */
export const tabsListVariants = cva(
  [
    // Base styles
    "flex",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Tabs variant
       */
      variant: {
        line: "border-b-2",
        enclosed: "border-2 rounded-[var(--radius-card)] p-1",
        pop: "border-2 rounded-[var(--radius-card)] p-1",
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
      variant: "line",
      inverted: false,
    },
    
    compoundVariants: [
      // Variant with inversion combinations
      {
        variant: "line",
        inverted: true,
        class: "border-border-inverse",
      },
      {
        variant: "enclosed",
        inverted: true,
        class: "bg-surface-primary-inverse border-border-inverse",
      },
      {
        variant: "pop",
        inverted: true,
        class: "bg-surface-primary-inverse border-border-inverse",
      },
      {
        variant: "line",
        inverted: false,
        class: "border-border",
      },
      {
        variant: "enclosed",
        inverted: false,
        class: "bg-surface-primary border-border",
      },
      {
        variant: "pop",
        inverted: false,
        class: "bg-surface-primary border-border",
      },
    ],
  }
);

/**
 * TabsTrigger variants using CVA (Class Variance Authority)
 */
export const tabsTriggerVariants = cva(
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
       * Tabs variant
       */
      variant: {
        line: "border-b-2 rounded-b-none",
        enclosed: "rounded-button",
        pop: "rounded-button",
      },
      
      /**
       * Active state
       */
      active: {
        true: "",
        false: "",
      },
      
      /**
       * Disabled state
       */
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "cursor-pointer hover:bg-surface-hover",
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
      variant: "line",
      active: false,
      disabled: false,
      inverted: false,
    },
    
    compoundVariants: [
      // Active state combinations
      {
        variant: "line",
        active: true,
        inverted: true,
        class: "border-brand-primary bg-brand-primary text-white",
      },
      {
        variant: "line",
        active: true,
        inverted: false,
        class: "border-brand-primary bg-brand-primary text-white",
      },
      
      {
        variant: "enclosed",
        active: true,
        inverted: true,
        class: "bg-brand-primary border-brand-primary text-white",
      },
      {
        variant: "enclosed",
        active: true,
        inverted: false,
        class: "bg-brand-primary border-brand-primary text-white",
      },
      
      {
        variant: "pop",
        active: true,
        inverted: true,
        class: "bg-brand-primary border-brand-primary text-white",
      },
      {
        variant: "pop",
        active: true,
        inverted: false,
        class: "bg-brand-primary border-brand-primary text-white",
      },
      
      // Inactive state combinations
      {
        variant: "line",
        active: false,
        inverted: true,
        class: "border-transparent text-text-secondary-inverse hover:bg-surface-hover-inverse",
      },
      {
        variant: "line",
        active: false,
        inverted: false,
        class: "border-transparent text-text-secondary hover:bg-surface-hover",
      },
      
      {
        variant: "enclosed",
        active: false,
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse text-text-secondary-inverse hover:bg-surface-hover-inverse",
      },
      {
        variant: "enclosed",
        active: false,
        inverted: false,
        class: "bg-surface-elevated border-border text-text-secondary hover:bg-surface-hover",
      },
      
      {
        variant: "pop",
        active: false,
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse text-text-secondary-inverse hover:bg-surface-hover-inverse",
      },
      {
        variant: "pop",
        active: false,
        inverted: false,
        class: "bg-surface-elevated border-border text-text-secondary hover:bg-surface-hover",
      },
      
      // Disabled state combinations
      {
        disabled: true,
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse text-text-disabled-inverse",
      },
      {
        disabled: true,
        inverted: false,
        class: "bg-surface-elevated border-border text-text-disabled",
      },
    ],
  }
);

/**
 * TabsContent variants using CVA (Class Variance Authority)
 */
export const tabsContentVariants = cva(
  [
    // Base styles
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
 * TabsPanel variants using CVA (Class Variance Authority)
 */
export const tabsPanelVariants = cva(
  [
    // Base styles
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
