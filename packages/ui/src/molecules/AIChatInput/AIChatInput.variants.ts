import { cva } from "class-variance-authority";

/**
 * AIChatInput variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Auto-expanding textarea
 * - Keyboard shortcuts
 * - Suggestion chips
 * - Loading states
 */
export const aiChatInputVariants = cva(
  [
    // Base styles
    "flex",
    "flex-col",
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
 * AIChatInput form variants using CVA (Class Variance Authority)
 */
export const aiChatInputFormVariants = cva(
  [
    // Base styles
    "flex",
    "items-end",
    "gap-2",
    "border-2",
    "rounded-[var(--radius-card)]",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Loading state
       */
      isLoading: {
        true: "opacity-75",
        false: "",
      },
      
      /**
       * Disabled state
       */
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "",
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
      isLoading: false,
      disabled: false,
      inverted: false,
    },
  }
);

/**
 * AIChatInput textarea variants using CVA (Class Variance Authority)
 */
export const aiChatInputTextareaVariants = cva(
  [
    // Base styles
    "flex-1",
    "px-4",
    "py-3",
    "border-2",
    "rounded-button",
    "resize-none",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
    "placeholder:text-text-muted",
    "min-h-[44px]",
    "max-h-[200px]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-surface-primary-inverse border-border-inverse text-text-inverse placeholder:text-text-muted-inverse focus:ring-border-inverse",
        false: "bg-surface-primary border-border text-text-primary placeholder:text-text-muted focus:ring-border",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * AIChatInput actions container variants using CVA (Class Variance Authority)
 */
export const aiChatInputActionsVariants = cva(
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
 * AIChatInput button variants using CVA (Class Variance Authority)
 */
export const aiChatInputButtonVariants = cva(
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
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
  ],
  {
    variants: {
      /**
       * Button variant
       */
      variant: {
        default: "bg-surface-elevated border-border text-text-secondary hover:bg-surface-hover hover:border-brand-primary",
        primary: "bg-brand-primary border-brand-primary text-white hover:bg-brand-primary-hover shadow-primary",
        ghost: "bg-transparent border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover",
      },
      
      /**
       * Loading state
       */
      isLoading: {
        true: "opacity-75 cursor-wait",
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
      variant: "default",
      isLoading: false,
      inverted: false,
    },
    
    compoundVariants: [
      // Default variant combinations
      {
        variant: "default",
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse text-text-secondary-inverse hover:bg-surface-hover-inverse hover:border-brand-primary cursor-pointer",
      },
      {
        variant: "default",
        inverted: false,
        class: "bg-surface-elevated border-border text-text-secondary hover:bg-surface-hover hover:border-brand-primary cursor-pointer",
      },
      
      // Primary variant combinations
      {
        variant: "primary",
        inverted: true,
        class: "bg-brand-primary border-brand-primary text-white hover:bg-brand-primary-hover shadow-primary cursor-pointer",
      },
      {
        variant: "primary",
        inverted: false,
        class: "bg-brand-primary border-brand-primary text-white hover:bg-brand-primary-hover shadow-primary cursor-pointer",
      },
      
      // Ghost variant combinations
      {
        variant: "ghost",
        inverted: true,
        class: "bg-transparent border-transparent text-text-secondary-inverse hover:text-text-inverse hover:bg-surface-hover-inverse cursor-pointer",
      },
      {
        variant: "ghost",
        inverted: false,
        class: "bg-transparent border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover cursor-pointer",
      },
    ],
  }
);

/**
 * AIChatInput character count variants using CVA (Class Variance Authority)
 */
export const aiChatInputCharCountVariants = cva(
  [
    // Base styles
    "text-xs",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Warning state (near limit)
       */
      isWarning: {
        true: "text-warning-600",
        false: "text-text-muted",
      },
      
      /**
       * Error state (at limit)
       */
      isError: {
        true: "text-error-600",
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
      isWarning: false,
      isError: false,
      inverted: false,
    },
    
    compoundVariants: [
      {
        isWarning: true,
        inverted: true,
        class: "text-warning-400",
      },
      {
        isWarning: true,
        inverted: false,
        class: "text-warning-600",
      },
      {
        isError: true,
        inverted: true,
        class: "text-error-400",
      },
      {
        isError: true,
        inverted: false,
        class: "text-error-600",
      },
    ],
  }
);

/**
 * AIChatInput suggestions variants using CVA (Class Variance Authority)
 */
export const aiChatInputSuggestionsVariants = cva(
  [
    // Base styles
    "flex",
    "flex-wrap",
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
