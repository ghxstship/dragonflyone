import { cva } from "class-variance-authority";

/**
 * CrewCard variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Status-based styling
 */
export const crewCardVariants = cva(
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
        detailed: "p-6",
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
 * CrewCard header variants using CVA (Class Variance Authority)
 */
export const crewCardHeaderVariants = cva(
  [
    // Base styles
    "flex",
    "items-start",
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
        compact: "gap-3",
        detailed: "",
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
 * CrewCard avatar variants using CVA (Class Variance Authority)
 */
export const crewCardAvatarVariants = cva(
  [
    // Base styles
    "flex-shrink-0",
    "w-16",
    "h-16",
    "rounded-full",
    "border-2",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "object-cover",
  ],
  {
    variants: {
      /**
       * Card variant
       */
      variant: {
        default: "w-16 h-16",
        compact: "w-12 h-12",
        detailed: "w-20 h-20",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "border-border-inverse",
        false: "border-border",
      },
    },
    defaultVariants: {
      variant: "default",
      inverted: false,
    },
  }
);

/**
 * CrewCard avatar placeholder variants using CVA (Class Variance Authority)
 */
export const crewCardAvatarPlaceholderVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-center",
    "font-bold",
    "text-lg",
    "border-2",
    "rounded-full",
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
        default: "w-16 h-16 text-lg",
        compact: "w-12 h-12 text-sm",
        detailed: "w-20 h-20 text-xl",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-surface-elevated-inverse border-border-inverse text-text-inverse",
        false: "bg-surface-elevated border-border text-text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
      inverted: false,
    },
  }
);

/**
 * CrewCard content variants using CVA (Class Variance Authority)
 */
export const crewCardContentVariants = cva(
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
        detailed: "space-y-3",
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
 * CrewCard name variants using CVA (Class Variance Authority)
 */
export const crewCardNameVariants = cva(
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
        detailed: "text-xl",
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
 * CrewCard role variants using CVA (Class Variance Authority)
 */
export const crewCardRoleVariants = cva(
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
       * Card variant
       */
      variant: {
        default: "text-base",
        compact: "text-sm",
        detailed: "text-lg",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "text-text-secondary-inverse",
        false: "text-text-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
      inverted: false,
    },
  }
);

/**
 * CrewCard status variants using CVA (Class Variance Authority)
 */
export const crewCardStatusVariants = cva(
  [
    // Base styles
    "px-3",
    "py-1",
    "rounded-badge",
    "text-xs",
    "font-bold",
    "uppercase",
    "tracking-wider",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Status type
       */
      status: {
        available: "bg-success-500 text-white border-2 border-success-600",
        assigned: "bg-brand-primary text-white border-2 border-brand-primary-hover",
        unavailable: "bg-error-500 text-white border-2 border-error-600",
        "on-call": "bg-warning-500 text-white border-2 border-warning-600",
      },
    },
    defaultVariants: {
      status: "available",
    },
  }
);

/**
 * CrewCard details variants using CVA (Class Variance Authority)
 */
export const crewCardDetailsVariants = cva(
  [
    // Base styles
    "space-y-1",
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
        detailed: "block",
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
 * CrewCard detail item variants using CVA (Class Variance Authority)
 */
export const crewCardDetailItemVariants = cva(
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
        true: "text-text-muted-inverse",
        false: "text-text-muted",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);
