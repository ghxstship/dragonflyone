import { cva } from "class-variance-authority";

/**
 * PaymentMethodSelector variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Payment method selection styling
 */
export const paymentMethodSelectorVariants = cva(
  [
    // Base styles
    "space-y-3",
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
 * PaymentMethodSelector method variants using CVA (Class Variance Authority)
 */
export const paymentMethodSelectorMethodVariants = cva(
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
 * PaymentMethodSelector method info variants using CVA (Class Variance Authority)
 */
export const paymentMethodSelectorMethodInfoVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-3",
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
 * PaymentMethodSelector method icon variants using CVA (Class Variance Authority)
 */
export const paymentMethodSelectorMethodIconVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-center",
    "w-10",
    "h-10",
    "rounded",
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
 * PaymentMethodSelector method details variants using CVA (Class Variance Authority)
 */
export const paymentMethodSelectorMethodDetailsVariants = cva(
  [
    // Base styles
    "flex-1",
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
 * PaymentMethodSelector method name variants using CVA (Class Variance Authority)
 */
export const paymentMethodSelectorMethodNameVariants = cva(
  [
    // Base styles
    "font-medium",
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
 * PaymentMethodSelector method meta variants using CVA (Class Variance Authority)
 */
export const paymentMethodSelectorMethodMetaVariants = cva(
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
 * PaymentMethodSelector method actions variants using CVA (Class Variance Authority)
 */
export const paymentMethodSelectorMethodActionsVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
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
 * PaymentMethodSelector action button variants using CVA (Class Variance Authority)
 */
export const paymentMethodSelectorActionButtonVariants = cva(
  [
    // Base styles
    "p-2",
    "border-2",
    "rounded-button",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "hover:scale-110",
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
        default: "",
        danger: "",
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
        class: "bg-surface-elevated-inverse border-border-inverse text-text-secondary-inverse hover:bg-surface-hover-inverse focus:ring-[var(--color-brand-primary)]",
      },
      {
        variant: "default",
        inverted: false,
        class: "bg-surface-elevated border-border text-text-secondary hover:bg-surface-hover focus:ring-[var(--color-brand-primary)]",
      },
      
      // Danger variant combinations
      {
        variant: "danger",
        inverted: true,
        class: "bg-error-500/10 border-error-500 text-error-600 hover:bg-error-500/20 focus:ring-[var(--color-error-500)]",
      },
      {
        variant: "danger",
        inverted: false,
        class: "bg-error-500/10 border-error-500 text-error-600 hover:bg-error-500/20 focus:ring-[var(--color-error-500)]",
      },
    ],
  }
);

/**
 * PaymentMethodSelector add button variants using CVA (Class Variance Authority)
 */
export const paymentMethodSelectorAddButtonVariants = cva(
  [
    // Base styles
    "w-full",
    "flex",
    "items-center",
    "justify-center",
    "gap-2",
    "p-4",
    "border-2",
    "border-dashed",
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
 * PaymentMethodSelector default badge variants using CVA (Class Variance Authority)
 */
export const paymentMethodSelectorDefaultBadgeVariants = cva(
  [
    // Base styles
    "px-2",
    "py-1",
    "text-xs",
    "font-bold",
    "uppercase",
    "tracking-wider",
    "rounded-badge",
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
        true: "bg-success-500/10 border-success-500 text-success-600",
        false: "bg-success-500/10 border-success-500 text-success-600",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);
