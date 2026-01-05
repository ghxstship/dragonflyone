import { cva } from "class-variance-authority";

/**
 * PaymentForm variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Secure payment form styling
 */
export const paymentFormVariants = cva(
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
 * PaymentForm header variants using CVA (Class Variance Authority)
 */
export const paymentFormHeaderVariants = cva(
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
 * PaymentForm title variants using CVA (Class Variance Authority)
 */
export const paymentFormTitleVariants = cva(
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
 * PaymentForm amount variants using CVA (Class Variance Authority)
 */
export const paymentFormAmountVariants = cva(
  [
    // Base styles
    "text-2xl",
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
        true: "text-brand-primary",
        false: "text-brand-primary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * PaymentForm content variants using CVA (Class Variance Authority)
 */
export const paymentFormContentVariants = cva(
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
 * PaymentForm section variants using CVA (Class Variance Authority)
 */
export const paymentFormSectionVariants = cva(
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
 * PaymentForm section title variants using CVA (Class Variance Authority)
 */
export const paymentFormSectionTitleVariants = cva(
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
 * PaymentForm saved methods variants using CVA (Class Variance Authority)
 */
export const paymentFormSavedMethodsVariants = cva(
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
 * PaymentForm saved method variants using CVA (Class Variance Authority)
 */
export const paymentFormSavedMethodVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-between",
    "p-4",
    "border-2",
    "rounded-[var(--radius-card)]",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "cursor-pointer",
    "hover:scale-105",
    "hover:shadow-hard",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
    "focus:ring-[var(--color-brand-primary)]",
  ],
  {
    variants: {
      /**
       * Selected state
       */
      selected: {
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
      selected: false,
      inverted: false,
    },
    
    compoundVariants: [
      // Selected state combinations
      {
        selected: true,
        inverted: true,
        class: "bg-brand-primary border-brand-primary text-white",
      },
      {
        selected: true,
        inverted: false,
        class: "bg-brand-primary border-brand-primary text-white",
      },
      
      // Unselected state combinations
      {
        selected: false,
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse hover:bg-surface-hover-inverse",
      },
      {
        selected: false,
        inverted: false,
        class: "bg-surface-elevated border-border hover:bg-surface-hover",
      },
    ],
  }
);

/**
 * PaymentForm saved method info variants using CVA (Class Variance Authority)
 */
export const paymentFormSavedMethodInfoVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-2",
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
 * PaymentForm saved method brand variants using CVA (Class Variance Authority)
 */
export const paymentFormSavedMethodBrandVariants = cva(
  [
    // Base styles
    "text-xl",
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
 * PaymentForm saved method details variants using CVA (Class Variance Authority)
 */
export const paymentFormSavedMethodDetailsVariants = cva(
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
 * PaymentForm input group variants using CVA (Class Variance Authority)
 */
export const paymentFormInputGroupVariants = cva(
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
 * PaymentForm input variants using CVA (Class Variance Authority)
 */
export const paymentFormInputVariants = cva(
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
 * PaymentForm checkbox variants using CVA (Class Variance Authority)
 */
export const paymentFormCheckboxVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-2",
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
 * PaymentForm error variants using CVA (Class Variance Authority)
 */
export const paymentFormErrorVariants = cva(
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
 * PaymentForm footer variants using CVA (Class Variance Authority)
 */
export const paymentFormFooterVariants = cva(
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
 * PaymentForm security note variants using CVA (Class Variance Authority)
 */
export const paymentFormSecurityNoteVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-2",
    "text-xs",
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
