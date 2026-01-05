import { cva } from "class-variance-authority";

/**
 * FloorPlanToolbar variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Toolbar with tool groups
 */
export const floorPlanToolbarVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-2",
    "p-2",
    "border-2",
    "rounded-[var(--radius-card)]",
    "shadow-hard",
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
        true: "bg-surface-elevated-inverse border-border-inverse",
        false: "bg-surface-elevated border-border",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * FloorPlanToolbar tool group variants using CVA (Class Variance Authority)
 */
export const floorPlanToolbarToolGroupVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-1",
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
 * FloorPlanToolbar separator variants using CVA (Class Variance Authority)
 */
export const floorPlanToolbarSeparatorVariants = cva(
  [
    // Base styles
    "w-px",
    "h-6",
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
        true: "bg-border-inverse",
        false: "bg-border",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * FloorPlanToolbar tool button variants using CVA (Class Variance Authority)
 */
export const floorPlanToolbarToolButtonVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-center",
    "w-10",
    "h-10",
    "border-2",
    "rounded-button",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "cursor-pointer",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
    "hover:scale-105",
  ],
  {
    variants: {
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
      // Active state combinations
      {
        active: true,
        inverted: true,
        class: "bg-brand-primary border-brand-primary text-white",
      },
      {
        active: true,
        inverted: false,
        class: "bg-brand-primary border-brand-primary text-white",
      },
      
      // Inactive state combinations
      {
        active: false,
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse text-text-secondary-inverse hover:bg-surface-hover-inverse hover:border-brand-primary",
      },
      {
        active: false,
        inverted: false,
        class: "bg-surface-elevated border-border text-text-secondary hover:bg-surface-hover hover:border-brand-primary",
      },
      
      // Disabled state combinations
      {
        disabled: true,
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse text-text-muted-inverse cursor-not-allowed",
      },
      {
        disabled: true,
        inverted: false,
        class: "bg-surface-elevated border-border text-text-muted cursor-not-allowed",
      },
    ],
  }
);

/**
 * FloorPlanToolbar action button variants using CVA (Class Variance Authority)
 */
export const floorPlanToolbarActionButtonVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-center",
    "w-10",
    "h-10",
    "border-2",
    "rounded-button",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "cursor-pointer",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
    "hover:scale-105",
  ],
  {
    variants: {
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
      disabled: false,
      inverted: false,
    },
    
    compoundVariants: [
      // Enabled state combinations
      {
        disabled: false,
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse text-text-secondary-inverse hover:bg-surface-hover-inverse hover:border-brand-primary",
      },
      {
        disabled: false,
        inverted: false,
        class: "bg-surface-elevated border-border text-text-secondary hover:bg-surface-hover hover:border-brand-primary",
      },
      
      // Disabled state combinations
      {
        disabled: true,
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse text-text-muted-inverse cursor-not-allowed",
      },
      {
        disabled: true,
        inverted: false,
        class: "bg-surface-elevated border-border text-text-muted cursor-not-allowed",
      },
    ],
  }
);
