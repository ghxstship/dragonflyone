import { cva } from "class-variance-authority";

/**
 * QuickAddFab variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Floating action button with expandable actions
 */
export const quickAddFabVariants = cva(
  [
    // Base styles
    "fixed",
    "z-50",
    "flex",
    "flex-col",
    "items-center",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Position
       */
      position: {
        "bottom-right": "bottom-6 right-6",
        "bottom-left": "bottom-6 left-6",
        "bottom-center": "bottom-6 left-1/2 -translate-x-1/2",
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
      position: "bottom-right",
      inverted: false,
    },
  }
);

/**
 * QuickAddFab actions container variants using CVA (Class Variance Authority)
 */
export const quickAddFabActionsContainerVariants = cva(
  [
    // Base styles
    "flex",
    "flex-col",
    "items-center",
    "gap-3",
    "mb-3",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Expanded state
       */
      expanded: {
        true: "opacity-100 scale-100",
        false: "opacity-0 scale-95 pointer-events-none",
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
      expanded: false,
      inverted: false,
    },
  }
);

/**
 * QuickAddFab action variants using CVA (Class Variance Authority)
 */
export const quickAddFabActionVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-2",
    "px-3",
    "py-2",
    "border-2",
    "rounded-[var(--radius-card)]",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "hover:scale-105",
    "hover:shadow-hard",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
    "focus:ring-[var(--color-brand-primary)]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-surface-elevated-inverse border-border-inverse text-text-inverse hover:bg-surface-hover-inverse",
        false: "bg-surface-elevated border-border text-text-primary hover:bg-surface-hover",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * QuickAddFab action label variants using CVA (Class Variance Authority)
 */
export const quickAddFabActionLabelVariants = cva(
  [
    // Base styles
    "text-sm",
    "font-medium",
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
 * QuickAddFab main button variants using CVA (Class Variance Authority)
 */
export const quickAddFabMainButtonVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-center",
    "w-14",
    "h-14",
    "border-2",
    "rounded-full",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "hover:scale-110",
    "hover:shadow-hard",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
    "focus:ring-[var(--color-brand-primary)]",
  ],
  {
    variants: {
      /**
       * Expanded state
       */
      expanded: {
        true: "rotate-45",
        false: "rotate-0",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-brand-primary border-brand-primary text-white",
        false: "bg-brand-primary border-brand-primary text-white",
      },
    },
    defaultVariants: {
      expanded: false,
      inverted: false,
    },
  }
);

/**
 * QuickAddFab icon variants using CVA (Class Variance Authority)
 */
export const quickAddFabIconVariants = cva(
  [
    // Base styles
    "w-6",
    "h-6",
    "transition-transform",
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
