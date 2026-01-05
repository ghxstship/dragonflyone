import { cva } from "class-variance-authority";

/**
 * OfflineIndicator variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Connection status indicators
 */
export const offlineIndicatorVariants = cva(
  [
    // Base styles
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Indicator variant
       */
      variant: {
        banner: [
          "flex",
          "items-center",
          "justify-between",
          "gap-4",
          "p-4",
          "border-2",
          "rounded-[var(--radius-card)]",
          "shadow-hard",
        ],
        badge: [
          "flex",
          "items-center",
          "gap-2",
          "px-3",
          "py-1.5",
          "border-2",
          "rounded-badge",
          "font-medium",
          "text-sm",
          "shadow-hard",
        ],
        toast: [
          "flex",
          "items-center",
          "gap-3",
          "p-4",
          "border-2",
          "rounded-[var(--radius-card)]",
          "shadow-hard",
          "max-w-sm",
        ],
      },
      
      /**
       * Connection status
       */
      isOffline: {
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
      variant: "banner",
      isOffline: false,
      inverted: false,
    },
    
    compoundVariants: [
      // Banner variant combinations
      {
        variant: "banner",
        isOffline: true,
        inverted: true,
        class: "bg-error-900/20 border-error-400 text-error-100",
      },
      {
        variant: "banner",
        isOffline: true,
        inverted: false,
        class: "bg-error-50 border-error-500 text-error-900",
      },
      {
        variant: "banner",
        isOffline: false,
        inverted: true,
        class: "bg-success-900/20 border-success-400 text-success-100",
      },
      {
        variant: "banner",
        isOffline: false,
        inverted: false,
        class: "bg-success-50 border-success-500 text-success-900",
      },
      
      // Badge variant combinations
      {
        variant: "badge",
        isOffline: true,
        inverted: true,
        class: "bg-error-900/20 border-error-400 text-error-100",
      },
      {
        variant: "badge",
        isOffline: true,
        inverted: false,
        class: "bg-error-50 border-error-500 text-error-900",
      },
      {
        variant: "badge",
        isOffline: false,
        inverted: true,
        class: "bg-success-900/20 border-success-400 text-success-100",
      },
      {
        variant: "badge",
        isOffline: false,
        inverted: false,
        class: "bg-success-50 border-success-500 text-success-900",
      },
      
      // Toast variant combinations
      {
        variant: "toast",
        isOffline: true,
        inverted: true,
        class: "bg-error-900/20 border-error-400 text-error-100",
      },
      {
        variant: "toast",
        isOffline: true,
        inverted: false,
        class: "bg-error-50 border-error-500 text-error-900",
      },
      {
        variant: "toast",
        isOffline: false,
        inverted: true,
        class: "bg-success-900/20 border-success-400 text-success-100",
      },
      {
        variant: "toast",
        isOffline: false,
        inverted: false,
        class: "bg-success-50 border-success-500 text-success-900",
      },
    ],
  }
);

/**
 * OfflineIndicator icon variants using CVA (Class Variance Authority)
 */
export const offlineIndicatorIconVariants = cva(
  [
    // Base styles
    "w-5",
    "h-5",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Connection status
       */
      isOffline: {
        true: "text-error-600",
        false: "text-success-600",
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
      isOffline: false,
      inverted: false,
    },
    
    compoundVariants: [
      {
        isOffline: true,
        inverted: true,
        class: "text-error-400",
      },
      {
        isOffline: true,
        inverted: false,
        class: "text-error-600",
      },
      {
        isOffline: false,
        inverted: true,
        class: "text-success-400",
      },
      {
        isOffline: false,
        inverted: false,
        class: "text-success-600",
      },
    ],
  }
);

/**
 * OfflineIndicator text variants using CVA (Class Variance Authority)
 */
export const offlineIndicatorTextVariants = cva(
  [
    // Base styles
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Connection status
       */
      isOffline: {
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
      isOffline: false,
      inverted: false,
    },
  }
);

/**
 * OfflineIndicator button variants using CVA (Class Variance Authority)
 */
export const offlineIndicatorButtonVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-2",
    "px-3",
    "py-1.5",
    "border-2",
    "rounded-button",
    "font-medium",
    "text-sm",
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
       * Connection status
       */
      isOffline: {
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
      isOffline: false,
      inverted: false,
    },
    
    compoundVariants: [
      {
        isOffline: true,
        inverted: true,
        class: "bg-error-800 border-error-400 text-error-100 hover:bg-error-700 focus:ring-error-400",
      },
      {
        isOffline: true,
        inverted: false,
        class: "bg-error-500 border-error-600 text-white hover:bg-error-600 focus:ring-error-500",
      },
      {
        isOffline: false,
        inverted: true,
        class: "bg-success-800 border-success-400 text-success-100 hover:bg-success-700 focus:ring-success-400",
      },
      {
        isOffline: false,
        inverted: false,
        class: "bg-success-500 border-success-600 text-white hover:bg-success-600 focus:ring-success-500",
      },
    ],
  }
);
