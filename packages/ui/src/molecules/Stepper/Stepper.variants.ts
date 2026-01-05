import { cva } from "class-variance-authority";

/**
 * Stepper variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Stepper with steps and progress
 */
export const stepperVariants = cva(
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
        horizontal: "flex",
        vertical: "flex flex-col",
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
      orientation: "horizontal",
      inverted: false,
    },
  }
);

/**
 * Stepper step container variants using CVA (Class Variance Authority)
 */
export const stepperStepContainerVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
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
        horizontal: "flex-row",
        vertical: "flex-col",
      },
      
      /**
       * Size
       */
      size: {
        sm: "gap-2",
        md: "gap-3",
        lg: "gap-4",
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
      orientation: "horizontal",
      size: "md",
      inverted: false,
    },
  }
);

/**
 * Stepper step variants using CVA (Class Variance Authority)
 */
export const stepperStepVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
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
        horizontal: "flex-row",
        vertical: "flex-col",
      },
      
      /**
       * Size
       */
      size: {
        sm: "gap-2",
        md: "gap-3",
        lg: "gap-4",
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
      orientation: "horizontal",
      size: "md",
      inverted: false,
    },
  }
);

/**
 * Stepper indicator variants using CVA (Class Variance Authority)
 */
export const stepperIndicatorVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-center",
    "border-2",
    "rounded-full",
    "font-bold",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Size
       */
      size: {
        sm: "w-6 h-6 text-xs",
        md: "w-8 h-8 text-sm",
        lg: "w-10 h-10 text-md",
      },
      
      /**
       * Step state
       */
      state: {
        active: "bg-brand-primary border-brand-primary text-white",
        completed: "bg-success-500 border-success-500 text-white",
        pending: "bg-surface-elevated border-border text-text-muted",
        disabled: "bg-surface-elevated border-border text-text-disabled",
      },
      
      /**
       * Clickable state
       */
      clickable: {
        true: "cursor-pointer hover:scale-110",
        false: "cursor-default",
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
      size: "md",
      state: "pending",
      clickable: false,
      inverted: false,
    },
    
    compoundVariants: [
      // State with inversion combinations
      {
        state: "active",
        inverted: true,
        class: "bg-brand-primary border-brand-primary text-white",
      },
      {
        state: "completed",
        inverted: true,
        class: "bg-success-500 border-success-500 text-white",
      },
      {
        state: "pending",
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse text-text-muted-inverse",
      },
      {
        state: "disabled",
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse text-text-disabled",
      },
    ],
  }
);

/**
 * Stepper content variants using CVA (Class Variance Authority)
 */
export const stepperContentVariants = cva(
  [
    // Base styles
    "flex",
    "flex-col",
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
        horizontal: "ml-3",
        vertical: "mt-2",
      },
      
      /**
       * Size
       */
      size: {
        sm: "",
        md: "",
        lg: "",
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
      orientation: "horizontal",
      size: "md",
      inverted: false,
    },
  }
);

/**
 * Stepper label variants using CVA (Class Variance Authority)
 */
export const stepperLabelVariants = cva(
  [
    // Base styles
    "font-medium",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Size
       */
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
      
      /**
       * Step state
       */
      state: {
        active: "text-text-primary",
        completed: "text-text-primary",
        pending: "text-text-secondary",
        disabled: "text-text-disabled",
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
      size: "md",
      state: "pending",
      inverted: false,
    },
    
    compoundVariants: [
      // State with inversion combinations
      {
        state: "active",
        inverted: true,
        class: "text-text-primary-inverse",
      },
      {
        state: "completed",
        inverted: true,
        class: "text-text-primary-inverse",
      },
      {
        state: "pending",
        inverted: true,
        class: "text-text-secondary-inverse",
      },
      {
        state: "disabled",
        inverted: true,
        class: "text-text-disabled",
      },
    ],
  }
);

/**
 * Stepper description variants using CVA (Class Variance Authority)
 */
export const stepperDescriptionVariants = cva(
  [
    // Base styles
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Size
       */
      size: {
        sm: "text-xs",
        md: "text-xs",
        lg: "text-sm",
      },
      
      /**
       * Step state
       */
      state: {
        active: "text-text-secondary",
        completed: "text-text-secondary",
        pending: "text-text-muted",
        disabled: "text-text-disabled",
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
      size: "md",
      state: "pending",
      inverted: false,
    },
    
    compoundVariants: [
      // State with inversion combinations
      {
        state: "active",
        inverted: true,
        class: "text-text-secondary-inverse",
      },
      {
        state: "completed",
        inverted: true,
        class: "text-text-secondary-inverse",
      },
      {
        state: "pending",
        inverted: true,
        class: "text-text-muted-inverse",
      },
      {
        state: "disabled",
        inverted: true,
        class: "text-text-disabled",
      },
    ],
  }
);

/**
 * Stepper connector variants using CVA (Class Variance Authority)
 */
export const stepperConnectorVariants = cva(
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
        horizontal: "w-full h-0.5 mx-2",
        vertical: "w-0.5 h-full my-2",
      },
      
      /**
       * Connector state
       */
      state: {
        active: "bg-brand-primary",
        completed: "bg-success-500",
        pending: "bg-border",
        disabled: "bg-border",
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
      orientation: "horizontal",
      state: "pending",
      inverted: false,
    },
    
    compoundVariants: [
      // State with inversion combinations
      {
        state: "active",
        inverted: true,
        class: "bg-brand-primary",
      },
      {
        state: "completed",
        inverted: true,
        class: "bg-success-500",
      },
      {
        state: "pending",
        inverted: true,
        class: "bg-border-inverse",
      },
      {
        state: "disabled",
        inverted: true,
        class: "bg-border-inverse",
      },
    ],
  }
);
