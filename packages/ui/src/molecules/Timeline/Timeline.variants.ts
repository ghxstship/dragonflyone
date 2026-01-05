import { cva } from "class-variance-authority";

/**
 * Timeline variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Timeline with items and connectors
 */
export const timelineVariants = cva(
  [
    // Base styles
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Orientation
       */
      orientation: {
        vertical: "flex flex-col",
        horizontal: "flex flex-row",
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
      orientation: "vertical",
      inverted: false,
    },
  }
);

/**
 * Timeline item container variants using CVA (Class Variance Authority)
 */
export const timelineItemContainerVariants = cva(
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
       * Orientation
       */
      orientation: {
        vertical: "flex-row",
        horizontal: "flex-col",
      },
      
      /**
       * Compact mode
       */
      compact: {
        true: "gap-3",
        false: "gap-4",
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
      orientation: "vertical",
      compact: false,
      inverted: false,
    },
  }
);

/**
 * Timeline indicator variants using CVA (Class Variance Authority)
 */
export const timelineIndicatorVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-center",
    "w-8",
    "h-8",
    "border-2",
    "rounded-full",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Status
       */
      status: {
        completed: "bg-success-500 border-success-500 text-white",
        current: "bg-brand-primary border-brand-primary text-white",
        upcoming: "bg-surface-elevated border-border text-text-muted",
        error: "bg-error-500 border-error-500 text-white",
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
      status: "upcoming",
      inverted: false,
    },
    
    compoundVariants: [
      // Status with inversion combinations
      {
        status: "completed",
        inverted: true,
        class: "bg-success-500 border-success-500 text-white",
      },
      {
        status: "current",
        inverted: true,
        class: "bg-brand-primary border-brand-primary text-white",
      },
      {
        status: "upcoming",
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse text-text-muted-inverse",
      },
      {
        status: "error",
        inverted: true,
        class: "bg-error-500 border-error-500 text-white",
      },
    ],
  }
);

/**
 * Timeline content variants using CVA (Class Variance Authority)
 */
export const timelineContentVariants = cva(
  [
    // Base styles
    "flex-1",
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
 * Timeline title variants using CVA (Class Variance Authority)
 */
export const timelineTitleVariants = cva(
  [
    // Base styles
    "font-bold",
    "text-sm",
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
        true: "text-text-primary-inverse",
        false: "text-text-primary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * Timeline description variants using CVA (Class Variance Authority)
 */
export const timelineDescriptionVariants = cva(
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
 * Timeline timestamp variants using CVA (Class Variance Authority)
 */
export const timelineTimestampVariants = cva(
  [
    // Base styles
    "text-xs",
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
 * Timeline connector variants using CVA (Class Variance Authority)
 */
export const timelineConnectorVariants = cva(
  [
    // Base styles
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Orientation
       */
      orientation: {
        vertical: "w-0.5 h-full ml-4",
        horizontal: "w-full h-0.5 mt-4",
      },
      
      /**
       * Status
       */
      status: {
        completed: "bg-success-500",
        current: "bg-brand-primary",
        upcoming: "bg-border",
        error: "bg-error-500",
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
      orientation: "vertical",
      status: "upcoming",
      inverted: false,
    },
    
    compoundVariants: [
      // Status with inversion combinations
      {
        status: "completed",
        inverted: true,
        class: "bg-success-500",
      },
      {
        status: "current",
        inverted: true,
        class: "bg-brand-primary",
      },
      {
        status: "upcoming",
        inverted: true,
        class: "bg-border-inverse",
      },
      {
        status: "error",
        inverted: true,
        class: "bg-error-500",
      },
    ],
  }
);
