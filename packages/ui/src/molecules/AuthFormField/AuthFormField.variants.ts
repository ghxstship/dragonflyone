import { cva } from "class-variance-authority";

/**
 * AuthFormField variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Authentication-specific styling
 */
export const authFormFieldVariants = cva(
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
 * AuthFormField label variants using CVA (Class Variance Authority)
 */
export const authFormFieldLabelVariants = cva(
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
       * Error state
       */
      error: {
        true: "text-error-600",
        false: "",
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
      error: false,
      inverted: false,
    },
    
    compoundVariants: [
      {
        error: true,
        inverted: true,
        class: "text-error-400",
      },
      {
        error: true,
        inverted: false,
        class: "text-error-600",
      },
    ],
  }
);

/**
 * AuthFormField input container variants using CVA (Class Variance Authority)
 */
export const authFormFieldInputContainerVariants = cva(
  [
    // Base styles
    "relative",
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
 * AuthFormField input variants using CVA (Class Variance Authority)
 */
export const authFormFieldInputVariants = cva(
  [
    // Base styles
    "w-full",
    "border-2",
    "rounded-button",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
    "placeholder:text-text-muted",
  ],
  {
    variants: {
      /**
       * Size variant
       */
      size: {
        sm: "h-10 text-sm px-3",
        md: "h-12 text-base px-4",
        lg: "h-14 text-lg px-5",
      },
      
      /**
       * Error state
       */
      error: {
        true: "border-error-500 focus:ring-error-500",
        false: "border-border focus:ring-border",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-surface-primary-inverse border-border-inverse text-text-inverse placeholder:text-text-muted-inverse focus:ring-border-inverse",
        false: "bg-surface-primary border-border text-text-primary placeholder:text-text-muted focus:ring-border",
      },
    },
    defaultVariants: {
      size: "md",
      error: false,
      inverted: false,
    },
    
    compoundVariants: [
      // Error state combinations
      {
        error: true,
        inverted: true,
        class: "bg-surface-primary-inverse border-error-400 text-text-inverse placeholder:text-text-muted-inverse focus:ring-error-400",
      },
      {
        error: true,
        inverted: false,
        class: "bg-surface-primary border-error-500 text-text-primary placeholder:text-text-muted focus:ring-error-500",
      },
    ],
  }
);

/**
 * AuthFormField icon variants using CVA (Class Variance Authority)
 */
export const authFormFieldIconVariants = cva(
  [
    // Base styles
    "absolute",
    "top-1/2",
    "-translate-y-1/2",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "pointer-events-none",
  ],
  {
    variants: {
      /**
       * Icon position
       */
      position: {
        left: "left-4",
        right: "right-4",
      },
      
      /**
       * Error state
       */
      error: {
        true: "text-error-600",
        false: "text-text-muted",
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
      position: "left",
      error: false,
      inverted: false,
    },
    
    compoundVariants: [
      // Left icon combinations
      {
        position: "left",
        error: true,
        inverted: true,
        class: "left-4 text-error-400",
      },
      {
        position: "left",
        error: true,
        inverted: false,
        class: "left-4 text-error-600",
      },
      {
        position: "left",
        error: false,
        inverted: true,
        class: "left-4 text-text-muted-inverse",
      },
      {
        position: "left",
        error: false,
        inverted: false,
        class: "left-4 text-text-muted",
      },
      
      // Right icon combinations
      {
        position: "right",
        error: true,
        inverted: true,
        class: "right-4 text-error-400",
      },
      {
        position: "right",
        error: true,
        inverted: false,
        class: "right-4 text-error-600",
      },
      {
        position: "right",
        error: false,
        inverted: true,
        class: "right-4 text-text-muted-inverse",
      },
      {
        position: "right",
        error: false,
        inverted: false,
        class: "right-4 text-text-muted",
      },
    ],
  }
);

/**
 * AuthFormField helper text variants using CVA (Class Variance Authority)
 */
export const authFormFieldHelperVariants = cva(
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
       * Error state
       */
      error: {
        true: "text-error-600",
        false: "text-text-muted",
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
      error: false,
      inverted: false,
    },
    
    compoundVariants: [
      {
        error: true,
        inverted: true,
        class: "text-error-400",
      },
      {
        error: true,
        inverted: false,
        class: "text-error-600",
      },
      {
        error: false,
        inverted: true,
        class: "text-text-muted-inverse",
      },
      {
        error: false,
        inverted: false,
        class: "text-text-muted",
      },
    ],
  }
);
