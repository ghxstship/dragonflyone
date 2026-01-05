import { cva } from "class-variance-authority";

/**
 * RefundDialog variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Refund dialog with form and validation
 */
export const refundDialogVariants = cva(
  [
    // Base styles
    "border-2",
    "rounded-[var(--radius-card)]",
    "shadow-hard",
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
        true: "bg-surface-primary-inverse border-border-inverse",
        false: "bg-surface-primary border-border",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * RefundDialog header variants using CVA (Class Variance Authority)
 */
export const refundDialogHeaderVariants = cva(
  [
    // Base styles
    "p-6",
    "border-b-2",
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
        true: "border-border-inverse",
        false: "border-border",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * RefundDialog title variants using CVA (Class Variance Authority)
 */
export const refundDialogTitleVariants = cva(
  [
    // Base styles
    "text-lg",
    "font-bold",
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
 * RefundDialog warning variants using CVA (Class Variance Authority)
 */
export const refundDialogWarningVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-2",
    "p-3",
    "border-2",
    "rounded-[var(--radius-card)]",
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
        true: "bg-warning-500/10 border-warning-500 text-warning-600",
        false: "bg-warning-500/10 border-warning-500 text-warning-600",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * RefundDialog content variants using CVA (Class Variance Authority)
 */
export const refundDialogContentVariants = cva(
  [
    // Base styles
    "p-6",
    "space-y-6",
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
 * RefundDialog section variants using CVA (Class Variance Authority)
 */
export const refundDialogSectionVariants = cva(
  [
    // Base styles
    "space-y-4",
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
 * RefundDialog section title variants using CVA (Class Variance Authority)
 */
export const refundDialogSectionTitleVariants = cva(
  [
    // Base styles
    "text-sm",
    "font-bold",
    "uppercase",
    "tracking-wider",
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
 * RefundDialog payment info variants using CVA (Class Variance Authority)
 */
export const refundDialogPaymentInfoVariants = cva(
  [
    // Base styles
    "space-y-2",
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
 * RefundDialog payment row variants using CVA (Class Variance Authority)
 */
export const refundDialogPaymentRowVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-between",
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
 * RefundDialog payment label variants using CVA (Class Variance Authority)
 */
export const refundDialogPaymentLabelVariants = cva(
  [
    // Base styles
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
 * RefundDialog payment value variants using CVA (Class Variance Authority)
 */
export const refundDialogPaymentValueVariants = cva(
  [
    // Base styles
    "font-bold",
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
 * RefundDialog input group variants using CVA (Class Variance Authority)
 */
export const refundDialogInputGroupVariants = cva(
  [
    // Base styles
    "space-y-2",
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
 * RefundDialog input variants using CVA (Class Variance Authority)
 */
export const refundDialogInputVariants = cva(
  [
    // Base styles
    "w-full",
    "px-4",
    "py-2",
    "border-2",
    "rounded-button",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
    "focus:ring-[var(--color-brand-primary)]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-surface-elevated-inverse border-border-inverse text-text-inverse placeholder-text-text-muted-inverse",
        false: "bg-surface-elevated border-border text-text-primary placeholder-text-text-muted",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * RefundDialog textarea variants using CVA (Class Variance Authority)
 */
export const refundDialogTextareaVariants = cva(
  [
    // Base styles
    "w-full",
    "px-4",
    "py-2",
    "border-2",
    "rounded-button",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
    "focus:ring-[var(--color-brand-primary)]",
    "resize-none",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-surface-elevated-inverse border-border-inverse text-text-inverse placeholder-text-text-muted-inverse",
        false: "bg-surface-elevated border-border text-text-primary placeholder-text-text-muted",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * RefundDialog error variants using CVA (Class Variance Authority)
 */
export const refundDialogErrorVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-2",
    "p-3",
    "border-2",
    "rounded-[var(--radius-card)]",
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
        true: "bg-error-500/10 border-error-500 text-error-600",
        false: "bg-error-500/10 border-error-500 text-error-600",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * RefundDialog footer variants using CVA (Class Variance Authority)
 */
export const refundDialogFooterVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-between",
    "gap-4",
    "p-6",
    "border-t-2",
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
        true: "border-border-inverse",
        false: "border-border",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * RefundDialog button variants using CVA (Class Variance Authority)
 */
export const refundDialogButtonVariants = cva(
  [
    // Base styles
    "px-4",
    "py-2",
    "border-2",
    "rounded-button",
    "font-medium",
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
        primary: "",
        secondary: "",
      },
      
      /**
       * Loading state
       */
      loading: {
        true: "opacity-50 cursor-not-allowed",
        false: "hover:scale-105",
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
      variant: "primary",
      loading: false,
      inverted: false,
    },
    
    compoundVariants: [
      // Primary variant combinations
      {
        variant: "primary",
        inverted: true,
        class: "bg-error-500 border-error-500 text-white focus:ring-[var(--color-error-500)]",
      },
      {
        variant: "primary",
        inverted: false,
        class: "bg-error-500 border-error-500 text-white focus:ring-[var(--color-error-500)]",
      },
      
      // Secondary variant combinations
      {
        variant: "secondary",
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse text-text-secondary-inverse hover:bg-surface-hover-inverse focus:ring-[var(--color-brand-primary)]",
      },
      {
        variant: "secondary",
        inverted: false,
        class: "bg-surface-elevated border-border text-text-secondary hover:bg-surface-hover focus:ring-[var(--color-brand-primary)]",
      },
    ],
  }
);
