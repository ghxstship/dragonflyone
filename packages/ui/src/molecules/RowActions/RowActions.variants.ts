import { cva } from "class-variance-authority";

/**
 * RowActions variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Row actions dropdown with keyboard navigation
 */
export const rowActionsVariants = cva(
  [
    // Base styles
    "relative",
    "inline-block",
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
 * RowActions trigger variants using CVA (Class Variance Authority)
 */
export const rowActionsTriggerVariants = cva(
  [
    // Base styles
    "inline-flex",
    "items-center",
    "justify-center",
    "border-2",
    "rounded-button",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "hover:scale-105",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
    "focus:ring-[var(--color-brand-primary)]",
  ],
  {
    variants: {
      /**
       * Trigger variant
       */
      variant: {
        icon: "p-1",
        text: "px-3 py-1.5",
        dots: "p-1",
      },
      
      /**
       * Size variant
       */
      size: {
        sm: "text-xs",
        md: "text-sm",
      },
      
      /**
       * Open state
       */
      open: {
        true: "",
        false: "",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-surface-elevated-inverse border-border-inverse text-text-secondary-inverse hover:bg-surface-hover-inverse",
        false: "bg-surface-elevated border-border text-text-secondary hover:bg-surface-hover",
      },
    },
    defaultVariants: {
      variant: "icon",
      size: "sm",
      open: false,
      inverted: false,
    },
  }
);

/**
 * RowActions dropdown variants using CVA (Class Variance Authority)
 */
export const rowActionsDropdownVariants = cva(
  [
    // Base styles
    "absolute",
    "z-50",
    "min-w-48",
    "border-2",
    "rounded-[var(--radius-card)]",
    "shadow-hard",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "origin-top",
  ],
  {
    variants: {
      /**
       * Alignment
       */
      align: {
        left: "left-0",
        right: "right-0",
      },
      
      /**
       * Open state
       */
      open: {
        true: "opacity-100 scale-100",
        false: "opacity-0 scale-95 pointer-events-none",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-surface-primary-inverse border-border-inverse",
        false: "bg-surface-primary border-border",
      },
    },
    defaultVariants: {
      align: "right",
      open: false,
      inverted: false,
    },
  }
);

/**
 * RowActions dropdown content variants using CVA (Class Variance Authority)
 */
export const rowActionsDropdownContentVariants = cva(
  [
    // Base styles
    "py-1",
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
 * RowActions action variants using CVA (Class Variance Authority)
 */
export const rowActionsActionVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-2",
    "w-full",
    "px-3",
    "py-2",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-inset",
    "focus:ring-[var(--color-brand-primary)]",
  ],
  {
    variants: {
      /**
       * Action variant
       */
      variant: {
        default: "",
        danger: "",
      },
      
      /**
       * Disabled state
       */
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "cursor-pointer hover:bg-surface-hover",
      },
      
      /**
       * Size variant
       */
      size: {
        sm: "text-xs",
        md: "text-sm",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "text-text-inverse",
        false: "text-text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
      disabled: false,
      size: "sm",
      inverted: false,
    },
    
    compoundVariants: [
      // Danger variant combinations
      {
        variant: "danger",
        inverted: true,
        class: "text-error-600 hover:bg-error-500/10",
      },
      {
        variant: "danger",
        inverted: false,
        class: "text-error-600 hover:bg-error-500/10",
      },
      
      // Disabled state combinations
      {
        disabled: true,
        inverted: true,
        class: "text-text-muted-inverse cursor-not-allowed",
      },
      {
        disabled: true,
        inverted: false,
        class: "text-text-muted cursor-not-allowed",
      },
    ],
  }
);

/**
 * RowActions action icon variants using CVA (Class Variance Authority)
 */
export const rowActionsActionIconVariants = cva(
  [
    // Base styles
    "w-4",
    "h-4",
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
        true: "text-text-secondary-inverse",
        false: "text-text-secondary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * RowActions action label variants using CVA (Class Variance Authority)
 */
export const rowActionsActionLabelVariants = cva(
  [
    // Base styles
    "flex-1",
    "text-left",
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
 * RowActions shortcut variants using CVA (Class Variance Authority)
 */
export const rowActionsShortcutVariants = cva(
  [
    // Base styles
    "text-xs",
    "font-mono",
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

/**
 * RowActions divider variants using CVA (Class Variance Authority)
 */
export const rowActionsDividerVariants = cva(
  [
    // Base styles
    "mx-3",
    "h-px",
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
