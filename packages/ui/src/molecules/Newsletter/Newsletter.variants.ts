import { cva } from "class-variance-authority";

/**
 * Newsletter variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Interactive form elements
 */
export const newsletterVariants = cva(
  [
    // Base styles
    "w-full",
    "max-w-md",
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
 * Newsletter form variants using CVA (Class Variance Authority)
 */
export const newsletterFormVariants = cva(
  [
    // Base styles
    "flex",
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
 * Newsletter input variants using CVA (Class Variance Authority)
 */
export const newsletterInputVariants = cva(
  [
    // Base styles
    "flex-1",
    "px-4",
    "py-3",
    "border-2",
    "rounded-button",
    "font-body",
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
       * Theme inversion
       */
      inverted: {
        true: "bg-transparent border-border-inverse text-text-inverse placeholder:text-text-muted-inverse focus:ring-border-inverse",
        false: "bg-surface-primary border-border text-text-primary placeholder:text-text-muted focus:ring-border",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * Newsletter button variants using CVA (Class Variance Authority)
 */
export const newsletterButtonVariants = cva(
  [
    // Base styles
    "px-6",
    "py-3",
    "border-2",
    "rounded-button",
    "font-bold",
    "text-sm",
    "uppercase",
    "tracking-wider",
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
       * Loading state
       */
      loading: {
        true: "opacity-75 cursor-wait",
        false: "cursor-pointer",
      },
      
      /**
       * Success state
       */
      success: {
        true: "bg-success-500 border-success-500 text-white",
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
      loading: false,
      success: false,
      inverted: false,
    },
    
    compoundVariants: [
      // Normal state combinations
      {
        loading: false,
        success: false,
        inverted: true,
        class: "bg-brand-primary border-brand-primary text-white hover:bg-brand-primary-hover shadow-primary cursor-pointer focus:ring-border-inverse",
      },
      {
        loading: false,
        success: false,
        inverted: false,
        class: "bg-brand-primary border-brand-primary text-white hover:bg-brand-primary-hover shadow-primary cursor-pointer focus:ring-border",
      },
      
      // Loading state combinations
      {
        loading: true,
        success: false,
        inverted: true,
        class: "bg-brand-primary border-brand-primary text-white opacity-75 cursor-wait focus:ring-border-inverse",
      },
      {
        loading: true,
        success: false,
        inverted: false,
        class: "bg-brand-primary border-brand-primary text-white opacity-75 cursor-wait focus:ring-border",
      },
      
      // Success state combinations
      {
        loading: false,
        success: true,
        inverted: true,
        class: "bg-success-500 border-success-500 text-white cursor-pointer focus:ring-border-inverse",
      },
      {
        loading: false,
        success: true,
        inverted: false,
        class: "bg-success-500 border-success-500 text-white cursor-pointer focus:ring-border",
      },
    ],
  }
);

/**
 * Newsletter success message variants using CVA (Class Variance Authority)
 */
export const newsletterSuccessVariants = cva(
  [
    // Base styles
    "mt-2",
    "text-sm",
    "font-medium",
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
        true: "text-success-400",
        false: "text-success-600",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);
