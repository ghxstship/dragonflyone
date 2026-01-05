import { cva } from "class-variance-authority";

/**
 * ContextBreadcrumb variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Hierarchical navigation
 */
export const contextBreadcrumbVariants = cva(
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
 * ContextBreadcrumb level variants using CVA (Class Variance Authority)
 */
export const contextBreadcrumbLevelVariants = cva(
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
 * ContextBreadcrumb dropdown variants using CVA (Class Variance Authority)
 */
export const contextBreadcrumbDropdownVariants = cva(
  [
    // Base styles
    "relative",
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
        true: "",
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
      isOpen: false,
      inverted: false,
    },
  }
);

/**
 * ContextBreadcrumb trigger variants using CVA (Class Variance Authority)
 */
export const contextBreadcrumbTriggerVariants = cva(
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
    "cursor-pointer",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
    "hover:scale-105",
    "hover:shadow-hard",
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
       * Theme inversion
       */
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      active: false,
      inverted: false,
    },
    
    compoundVariants: [
      // Active state combinations
      {
        active: true,
        inverted: true,
        class: "bg-surface-elevated-inverse border-brand-primary text-text-inverse",
      },
      {
        active: true,
        inverted: false,
        class: "bg-surface-elevated border-brand-primary text-text-primary",
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
    ],
  }
);

/**
 * ContextBreadcrumb menu variants using CVA (Class Variance Authority)
 */
export const contextBreadcrumbMenuVariants = cva(
  [
    // Base styles
    "absolute",
    "top-full",
    "left-0",
    "mt-1",
    "min-w-[200px]",
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
 * ContextBreadcrumb menu item variants using CVA (Class Variance Authority)
 */
export const contextBreadcrumbMenuItemVariants = cva(
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
    "hover:bg-surface-hover",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "hover:bg-surface-hover-inverse",
        false: "hover:bg-surface-hover",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * ContextBreadcrumb separator variants using CVA (Class Variance Authority)
 */
export const contextBreadcrumbSeparatorVariants = cva(
  [
    // Base styles
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
        true: "text-text-muted-inverse",
        false: "text-text-muted",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);
