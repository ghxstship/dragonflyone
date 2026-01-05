import { cva } from "class-variance-authority";

/**
 * DealCard variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Deal pipeline visualization
 */
export const dealCardVariants = cva(
  [
    // Base styles
    "border-2",
    "rounded-[var(--radius-card)]",
    "shadow-hard",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "cursor-pointer",
    "hover:shadow-hard-lg",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
    "focus:ring-[var(--color-brand-primary)]",
  ],
  {
    variants: {
      /**
       * Card variant
       */
      variant: {
        default: "p-6",
        compact: "p-4",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-surface-primary-inverse border-border-inverse",
        false: "bg-surface-primary border-border",
      },
    },
    defaultVariants: {
      variant: "default",
      inverted: false,
    },
  }
);

/**
 * DealCard header variants using CVA (Class Variance Authority)
 */
export const dealCardHeaderVariants = cva(
  [
    // Base styles
    "flex",
    "items-start",
    "justify-between",
    "gap-4",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Card variant
       */
      variant: {
        default: "",
        compact: "gap-2",
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
  }
);

/**
 * DealCard deal info variants using CVA (Class Variance Authority)
 */
export const dealCardDealInfoVariants = cva(
  [
    // Base styles
    "flex-1",
    "min-w-0",
    "space-y-2",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Card variant
       */
      variant: {
        default: "space-y-2",
        compact: "space-y-1",
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
  }
);

/**
 * DealCard deal number variants using CVA (Class Variance Authority)
 */
export const dealCardDealNumberVariants = cva(
  [
    // Base styles
    "text-xs",
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
 * DealCard deal name variants using CVA (Class Variance Authority)
 */
export const dealCardDealNameVariants = cva(
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
       * Card variant
       */
      variant: {
        default: "text-lg",
        compact: "text-base",
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
      variant: "default",
      inverted: false,
    },
  }
);

/**
 * DealCard metrics variants using CVA (Class Variance Authority)
 */
export const dealCardMetricsVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-4",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Card variant
       */
      variant: {
        default: "",
        compact: "gap-2",
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
  }
);

/**
 * DealCard metric variants using CVA (Class Variance Authority)
 */
export const dealCardMetricVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-1",
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
 * DealCard metric label variants using CVA (Class Variance Authority)
 */
export const dealCardMetricLabelVariants = cva(
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
 * DealCard metric value variants using CVA (Class Variance Authority)
 */
export const dealCardMetricValueVariants = cva(
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
       * Metric type
       */
      type: {
        value: "text-lg",
        probability: "text-base",
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
      type: "value",
      inverted: false,
    },
    
    compoundVariants: [
      // Value type combinations
      {
        type: "value",
        inverted: true,
        class: "text-lg text-text-inverse",
      },
      {
        type: "value",
        inverted: false,
        class: "text-lg text-text-primary",
      },
      
      // Probability type combinations
      {
        type: "probability",
        inverted: true,
        class: "text-base text-text-inverse",
      },
      {
        type: "probability",
        inverted: false,
        class: "text-base text-text-primary",
      },
    ],
  }
);

/**
 * DealCard details variants using CVA (Class Variance Authority)
 */
export const dealCardDetailsVariants = cva(
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
       * Card variant
       */
      variant: {
        default: "block",
        compact: "hidden",
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
  }
);

/**
 * DealCard detail item variants using CVA (Class Variance Authority)
 */
export const dealCardDetailItemVariants = cva(
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
 * DealCard stage variants using CVA (Class Variance Authority)
 */
export const dealCardStageVariants = cva(
  [
    // Base styles
    "px-3",
    "py-1",
    "rounded-badge",
    "text-xs",
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
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);
