import { cva } from "class-variance-authority";

/**
 * ErrorState variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Comic panel style for error display
 */
export const errorStateVariants = cva(
  [
    // Base styles
    "flex",
    "flex-col",
    "items-center",
    "justify-center",
    "text-center",
    "p-8",
    "border-2",
    "border-dashed",
    "rounded-[var(--radius-modal)]",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Error severity
       */
      severity: {
        error: "bg-error-50 border-error-500 text-error-900",
        warning: "bg-warning-50 border-warning-500 text-warning-900",
        info: "bg-primary-50 border-primary-500 text-primary-900",
      },
      
      /**
       * Full page layout
       */
      fullPage: {
        true: "min-h-screen",
        false: "min-h-[400px]",
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
      severity: "error",
      fullPage: false,
      inverted: false,
    },
    
    compoundVariants: [
      // Error severity combinations
      {
        severity: "error",
        inverted: true,
        class: "bg-error-900/20 border-error-400 text-error-100",
      },
      {
        severity: "error",
        inverted: false,
        class: "bg-error-50 border-error-500 text-error-900",
      },
      
      // Warning severity combinations
      {
        severity: "warning",
        inverted: true,
        class: "bg-warning-900/20 border-warning-400 text-warning-100",
      },
      {
        severity: "warning",
        inverted: false,
        class: "bg-warning-50 border-warning-500 text-warning-900",
      },
      
      // Info severity combinations
      {
        severity: "info",
        inverted: true,
        class: "bg-primary-900/20 border-primary-400 text-primary-100",
      },
      {
        severity: "info",
        inverted: false,
        class: "bg-primary-50 border-primary-500 text-primary-900",
      },
    ],
  }
);

/**
 * ErrorState icon variants using CVA (Class Variance Authority)
 */
export const errorStateIconVariants = cva(
  [
    // Base styles
    "w-16",
    "h-16",
    "mb-4",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Error severity
       */
      severity: {
        error: "text-error-600",
        warning: "text-warning-600",
        info: "text-primary-600",
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
      severity: "error",
      inverted: false,
    },
    
    compoundVariants: [
      {
        severity: "error",
        inverted: true,
        class: "text-error-400",
      },
      {
        severity: "error",
        inverted: false,
        class: "text-error-600",
      },
      {
        severity: "warning",
        inverted: true,
        class: "text-warning-400",
      },
      {
        severity: "warning",
        inverted: false,
        class: "text-warning-600",
      },
      {
        severity: "info",
        inverted: true,
        class: "text-primary-400",
      },
      {
        severity: "info",
        inverted: false,
        class: "text-primary-600",
      },
    ],
  }
);

/**
 * ErrorState title variants using CVA (Class Variance Authority)
 */
export const errorStateTitleVariants = cva(
  [
    // Base styles
    "text-2xl",
    "font-bold",
    "mb-4",
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
 * ErrorState description variants using CVA (Class Variance Authority)
 */
export const errorStateDescriptionVariants = cva(
  [
    // Base styles
    "mb-6",
    "max-w-md",
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
 * ErrorState details variants using CVA (Class Variance Authority)
 */
export const errorStateDetailsVariants = cva(
  [
    // Base styles
    "mt-4",
    "p-4",
    "bg-black/10",
    "border",
    "border-black/20",
    "rounded-[var(--radius-card)]",
    "font-mono",
    "text-xs",
    "text-left",
    "max-h-32",
    "overflow-y-auto",
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
        true: "bg-white/5 border-white/10 text-text-tertiary-inverse",
        false: "bg-black/5 border-black/10 text-text-tertiary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);
