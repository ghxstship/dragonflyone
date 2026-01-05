import { cva } from "class-variance-authority";

/**
 * ConfirmDialog container variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Icon emphasis
 */
export const confirmDialogVariants = cva(
  [
    // Base styles
    "flex",
    "flex-col",
    "items-center",
    "text-center",
    "p-6",
    "border-2",
    "rounded-[var(--radius-modal)]",
    "max-w-md",
    "w-full",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "animate-pop-in",
  ],
  {
    variants: {
      /**
       * Dialog variant
       */
      variant: {
        danger: "bg-error-50 border-error-500 text-error-900",
        warning: "bg-warning-50 border-warning-500 text-warning-900",
        info: "bg-primary-50 border-primary-500 text-primary-900",
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
      variant: "info",
      inverted: false,
    },
    
    compoundVariants: [
      {
        variant: "danger",
        inverted: true,
        class: "bg-error-900 border-error-400 text-error-100",
      },
      {
        variant: "danger",
        inverted: false,
        class: "bg-error-50 border-error-500 text-error-900",
      },
      {
        variant: "warning",
        inverted: true,
        class: "bg-warning-900 border-warning-400 text-warning-100",
      },
      {
        variant: "warning",
        inverted: false,
        class: "bg-warning-50 border-warning-500 text-warning-900",
      },
      {
        variant: "info",
        inverted: true,
        class: "bg-primary-900 border-primary-400 text-primary-100",
      },
      {
        variant: "info",
        inverted: false,
        class: "bg-primary-50 border-primary-500 text-primary-900",
      },
    ],
  }
);

/**
 * ConfirmDialog icon variants using CVA (Class Variance Authority)
 */
export const confirmDialogIconVariants = cva(
  [
    // Base styles
    "w-12",
    "h-12",
    "mb-4",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Dialog variant
       */
      variant: {
        danger: "text-error-600",
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
      variant: "info",
      inverted: false,
    },
    
    compoundVariants: [
      {
        variant: "danger",
        inverted: true,
        class: "text-error-400",
      },
      {
        variant: "danger",
        inverted: false,
        class: "text-error-600",
      },
      {
        variant: "warning",
        inverted: true,
        class: "text-warning-400",
      },
      {
        variant: "warning",
        inverted: false,
        class: "text-warning-600",
      },
      {
        variant: "info",
        inverted: true,
        class: "text-primary-400",
      },
      {
        variant: "info",
        inverted: false,
        class: "text-primary-600",
      },
    ],
  }
);

/**
 * ConfirmDialog title variants using CVA (Class Variance Authority)
 */
export const confirmDialogTitleVariants = cva(
  [
    // Base styles
    "text-xl",
    "font-bold",
    "mb-2",
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
 * ConfirmDialog message variants using CVA (Class Variance Authority)
 */
export const confirmDialogMessageVariants = cva(
  [
    // Base styles
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
 * ConfirmDialog details variants using CVA (Class Variance Authority)
 */
export const confirmDialogDetailsVariants = cva(
  [
    // Base styles
    "text-sm",
    "mb-4",
    "p-3",
    "bg-black/10",
    "border",
    "border-black/20",
    "rounded-[var(--radius-card)]",
    "font-mono",
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
        true: "bg-white/5 border-white/10",
        false: "bg-black/5 border-black/10",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);
