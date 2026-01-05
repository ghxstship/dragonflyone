import { cva } from "class-variance-authority";

/**
 * DealQuickView variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Modal overlay styling
 */
export const dealQuickViewVariants = cva(
  [
    // Base styles
    "fixed",
    "inset-0",
    "z-modal",
    "flex",
    "items-center",
    "justify-center",
    "p-4",
    "bg-black/50",
    "backdrop-blur-sm",
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
 * DealQuickView modal variants using CVA (Class Variance Authority)
 */
export const dealQuickViewModalVariants = cva(
  [
    // Base styles
    "bg-surface-primary",
    "border-2",
    "rounded-[var(--radius-modal)]",
    "shadow-hard-lg",
    "max-w-2xl",
    "w-full",
    "max-h-[90vh]",
    "overflow-hidden",
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
 * DealQuickView header variants using CVA (Class Variance Authority)
 */
export const dealQuickViewHeaderVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-between",
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
 * DealQuickView title variants using CVA (Class Variance Authority)
 */
export const dealQuickViewTitleVariants = cva(
  [
    // Base styles
    "text-xl",
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
 * DealQuickView close button variants using CVA (Class Variance Authority)
 */
export const dealQuickViewCloseVariants = cva(
  [
    // Base styles
    "p-2",
    "border-2",
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
       * Theme inversion
       */
      inverted: {
        true: "bg-surface-elevated-inverse border-border-inverse text-text-secondary-inverse hover:bg-surface-hover-inverse",
        false: "bg-surface-elevated border-border text-text-secondary hover:bg-surface-hover",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * DealQuickView content variants using CVA (Class Variance Authority)
 */
export const dealQuickViewContentVariants = cva(
  [
    // Base styles
    "p-6",
    "space-y-6",
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
 * DealQuickView section variants using CVA (Class Variance Authority)
 */
export const dealQuickViewSectionVariants = cva(
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
 * DealQuickView section title variants using CVA (Class Variance Authority)
 */
export const dealQuickViewSectionTitleVariants = cva(
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
 * DealQuickView metrics variants using CVA (Class Variance Authority)
 */
export const dealQuickViewMetricsVariants = cva(
  [
    // Base styles
    "grid",
    "grid-cols-2",
    "gap-4",
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
 * DealQuickView metric variants using CVA (Class Variance Authority)
 */
export const dealQuickViewMetricVariants = cva(
  [
    // Base styles
    "p-4",
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
        true: "bg-surface-elevated-inverse border-border-inverse",
        false: "bg-surface-elevated border-border",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * DealQuickView metric label variants using CVA (Class Variance Authority)
 */
export const dealQuickViewMetricLabelVariants = cva(
  [
    // Base styles
    "text-xs",
    "font-medium",
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
 * DealQuickView metric value variants using CVA (Class Variance Authority)
 */
export const dealQuickViewMetricValueVariants = cva(
  [
    // Base styles
    "text-xl",
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
 * DealQuickView info item variants using CVA (Class Variance Authority)
 */
export const dealQuickViewInfoItemVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-2",
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
 * DealQuickView footer variants using CVA (Class Variance Authority)
 */
export const dealQuickViewFooterVariants = cva(
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
 * DealQuickView action button variants using CVA (Class Variance Authority)
 */
export const dealQuickViewActionVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-2",
    "px-4",
    "py-2",
    "border-2",
    "rounded-button",
    "font-medium",
    "text-sm",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "hover:scale-105",
  ],
  {
    variants: {
      /**
       * Button variant
       */
      variant: {
        default: "bg-surface-elevated border-border text-text-primary hover:bg-surface-hover",
        primary: "bg-brand-primary border-brand-primary text-white hover:bg-brand-primary-hover shadow-primary",
        danger: "bg-error-500 border-error-600 text-white hover:bg-error-600",
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
      variant: "default",
      inverted: false,
    },
    
    compoundVariants: [
      // Default variant combinations
      {
        variant: "default",
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse text-text-inverse hover:bg-surface-hover-inverse",
      },
      {
        variant: "default",
        inverted: false,
        class: "bg-surface-elevated border-border text-text-primary hover:bg-surface-hover",
      },
      
      // Primary variant combinations
      {
        variant: "primary",
        inverted: true,
        class: "bg-brand-primary border-brand-primary text-white hover:bg-brand-primary-hover shadow-primary",
      },
      {
        variant: "primary",
        inverted: false,
        class: "bg-brand-primary border-brand-primary text-white hover:bg-brand-primary-hover shadow-primary",
      },
      
      // Danger variant combinations
      {
        variant: "danger",
        inverted: true,
        class: "bg-error-500 border-error-600 text-white hover:bg-error-600",
      },
      {
        variant: "danger",
        inverted: false,
        class: "bg-error-500 border-error-600 text-white hover:bg-error-600",
      },
    ],
  }
);
