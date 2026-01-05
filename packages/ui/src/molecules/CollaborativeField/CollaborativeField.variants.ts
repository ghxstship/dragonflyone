import { cva } from "class-variance-authority";

/**
 * CollaborativeField variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Collaboration indicators
 */
export const collaborativeFieldVariants = cva(
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
       * Lock state
       */
      isLocked: {
        true: "",
        false: "",
      },
      
      /**
       * Editing state
       */
      isEditing: {
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
      isLocked: false,
      isEditing: false,
      inverted: false,
    },
    
    compoundVariants: [
      // Locked state combinations
      {
        isLocked: true,
        inverted: true,
        class: "border-2 border-error-400 rounded-[var(--radius-card)] bg-error-900/20",
      },
      {
        isLocked: true,
        inverted: false,
        class: "border-2 border-error-500 rounded-[var(--radius-card)] bg-error-50",
      },
      
      // Editing state combinations
      {
        isEditing: true,
        inverted: true,
        class: "border-2 border-brand-primary rounded-[var(--radius-card)] bg-brand-primary/20",
      },
      {
        isEditing: true,
        inverted: false,
        class: "border-2 border-brand-primary rounded-[var(--radius-card)] bg-brand-primary/10",
      },
      
      // Normal state combinations
      {
        isLocked: false,
        isEditing: false,
        inverted: true,
        class: "border-2 border-transparent rounded-[var(--radius-card)]",
      },
      {
        isLocked: false,
        isEditing: false,
        inverted: false,
        class: "border-2 border-transparent rounded-[var(--radius-card)]",
      },
    ],
  }
);

/**
 * CollaborativeField overlay variants using CVA (Class Variance Authority)
 */
export const collaborativeFieldOverlayVariants = cva(
  [
    // Base styles
    "absolute",
    "inset-0",
    "flex",
    "items-center",
    "justify-center",
    "bg-black/50",
    "backdrop-blur-sm",
    "rounded-[var(--radius-card)]",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "pointer-events-none",
  ],
  {
    variants: {
      /**
       * Visibility state
       */
      visible: {
        true: "opacity-100 pointer-events-auto",
        false: "opacity-0 pointer-events-none",
      },
    },
    defaultVariants: {
      visible: false,
    },
  }
);

/**
 * CollaborativeField indicator variants using CVA (Class Variance Authority)
 */
export const collaborativeFieldIndicatorVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-2",
    "px-3",
    "py-2",
    "rounded-badge",
    "text-sm",
    "font-medium",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Indicator type
       */
      type: {
        locked: "bg-error-500 text-white border-2 border-error-600",
        editing: "bg-brand-primary text-white border-2 border-brand-primary-hover",
      },
    },
    defaultVariants: {
      type: "locked",
    },
  }
);

/**
 * CollaborativeField user avatar variants using CVA (Class Variance Authority)
 */
export const collaborativeFieldUserVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-center",
    "w-6",
    "h-6",
    "rounded-full",
    "text-xs",
    "font-bold",
    "border-2",
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
        true: "bg-surface-elevated-inverse border-border-inverse text-text-inverse",
        false: "bg-surface-elevated border-border text-text-primary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * CollaborativeField cursor variants using CVA (Class Variance Authority)
 */
export const collaborativeFieldCursorVariants = cva(
  [
    // Base styles
    "absolute",
    "w-0.5",
    "h-4",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "animate-pulse",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-text-inverse",
        false: "bg-text-primary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);
