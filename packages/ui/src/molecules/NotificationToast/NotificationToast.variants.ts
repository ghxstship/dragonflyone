import { cva } from "class-variance-authority";

/**
 * NotificationToast variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Slide and bounce animations
 */
export const notificationToastVariants = cva(
  [
    // Base styles
    "relative",
    "flex",
    "items-start",
    "gap-3",
    "p-4",
    "border-2",
    "rounded-[var(--radius-card)]",
    "shadow-hard",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "animate-slide-up-bounce",
    "max-w-md",
    "w-full",
  ],
  {
    variants: {
      /**
       * Toast type
       */
      type: {
        success: "bg-success-50 border-success-500 text-success-900",
        error: "bg-error-50 border-error-500 text-error-900",
        info: "bg-primary-50 border-primary-500 text-primary-900",
        warning: "bg-warning-50 border-warning-500 text-warning-900",
      },
    },
    defaultVariants: {
      type: "info",
    },
  }
);

/**
 * NotificationToast icon variants using CVA (Class Variance Authority)
 */
export const notificationToastIconVariants = cva(
  [
    // Base styles
    "flex-shrink-0",
    "w-5",
    "h-5",
    "mt-0.5",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Toast type
       */
      type: {
        success: "text-success-600",
        error: "text-error-600",
        info: "text-primary-600",
        warning: "text-warning-600",
      },
    },
    defaultVariants: {
      type: "info",
    },
  }
);

/**
 * NotificationToast content variants using CVA (Class Variance Authority)
 */
export const notificationToastContentVariants = cva(
  [
    // Base styles
    "flex-1",
    "min-w-0",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Toast type
       */
      type: {
        success: "",
        error: "",
        info: "",
        warning: "",
      },
    },
    defaultVariants: {
      type: "info",
    },
  }
);

/**
 * NotificationToast title variants using CVA (Class Variance Authority)
 */
export const notificationToastTitleVariants = cva(
  [
    // Base styles
    "font-bold",
    "text-sm",
    "mb-1",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Toast type
       */
      type: {
        success: "text-success-900",
        error: "text-error-900",
        info: "text-primary-900",
        warning: "text-warning-900",
      },
    },
    defaultVariants: {
      type: "info",
    },
  }
);

/**
 * NotificationToast message variants using CVA (Class Variance Authority)
 */
export const notificationToastMessageVariants = cva(
  [
    // Base styles
    "text-sm",
    "opacity-90",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Toast type
       */
      type: {
        success: "text-success-800",
        error: "text-error-800",
        info: "text-primary-800",
        warning: "text-warning-800",
      },
    },
    defaultVariants: {
      type: "info",
    },
  }
);

/**
 * NotificationToast close button variants using CVA (Class Variance Authority)
 */
export const notificationToastCloseVariants = cva(
  [
    // Base styles
    "flex-shrink-0",
    "p-1",
    "rounded-button",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "hover:scale-110",
    "hover:shadow-hard",
  ],
  {
    variants: {
      /**
       * Toast type
       */
      type: {
        success: "text-success-600 hover:bg-success-100",
        error: "text-error-600 hover:bg-error-100",
        info: "text-primary-600 hover:bg-primary-100",
        warning: "text-warning-600 hover:bg-warning-100",
      },
    },
    defaultVariants: {
      type: "info",
    },
  }
);

/**
 * NotificationToast progress bar variants using CVA (Class Variance Authority)
 */
export const notificationToastProgressVariants = cva(
  [
    // Base styles
    "absolute",
    "bottom-0",
    "left-0",
    "h-1",
    "transition-all",
    "duration-100",
    "ease-linear",
  ],
  {
    variants: {
      /**
       * Toast type
       */
      type: {
        success: "bg-success-500",
        error: "bg-error-500",
        info: "bg-primary-500",
        warning: "bg-warning-500",
      },
    },
    defaultVariants: {
      type: "info",
    },
  }
);

/**
 * NotificationToast undo button variants using CVA (Class Variance Authority)
 */
export const notificationToastUndoVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-1",
    "px-2",
    "py-1",
    "border-2",
    "rounded-button",
    "text-xs",
    "font-medium",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Toast type
       */
      type: {
        success: "border-success-300 text-success-700 hover:bg-success-100",
        error: "border-error-300 text-error-700 hover:bg-error-100",
        info: "border-primary-300 text-primary-700 hover:bg-primary-100",
        warning: "border-warning-300 text-warning-700 hover:bg-warning-100",
      },
    },
    defaultVariants: {
      type: "info",
    },
  }
);
