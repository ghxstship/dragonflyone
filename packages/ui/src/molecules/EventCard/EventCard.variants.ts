import { cva } from "class-variance-authority";

/**
 * EventCard variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Interactive hover states
 */
export const eventCardVariants = cva(
  [
    // Base styles
    "relative",
    "overflow-hidden",
    "border-2",
    "rounded-[var(--radius-card)]",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "cursor-pointer",
    "hover:shadow-hard-lg",
    "hover:scale-[1.02]",
  ],
  {
    variants: {
      /**
       * Card variant
       */
      variant: {
        default: "bg-surface-primary border-border",
        compact: "bg-surface-primary border-border",
        featured: "bg-surface-elevated border-brand-primary shadow-hard",
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
        class: "bg-surface-inverse border-border-inverse",
      },
      {
        variant: "default",
        inverted: false,
        class: "bg-surface-primary border-border",
      },
      
      // Compact variant combinations
      {
        variant: "compact",
        inverted: true,
        class: "bg-surface-inverse border-border-inverse",
      },
      {
        variant: "compact",
        inverted: false,
        class: "bg-surface-primary border-border",
      },
      
      // Featured variant combinations
      {
        variant: "featured",
        inverted: true,
        class: "bg-surface-elevated-inverse border-brand-primary shadow-hard",
      },
      {
        variant: "featured",
        inverted: false,
        class: "bg-surface-elevated border-brand-primary shadow-hard",
      },
    ],
  }
);

/**
 * EventCard image variants using CVA (Class Variance Authority)
 */
export const eventCardImageVariants = cva(
  [
    // Base styles
    "w-full",
    "h-48",
    "object-cover",
    "transition-transform",
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
        compact: "h-32",
        featured: "h-56",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * EventCard date variants using CVA (Class Variance Authority)
 */
export const eventCardDateVariants = cva(
  [
    // Base styles
    "flex",
    "flex-col",
    "items-center",
    "justify-center",
    "p-2",
    "border-2",
    "rounded-button",
    "font-bold",
    "text-center",
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
        true: "bg-surface-inverse border-border-inverse text-text-inverse",
        false: "bg-surface-elevated border-border text-text-primary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * EventCard content variants using CVA (Class Variance Authority)
 */
export const eventCardContentVariants = cva(
  [
    // Base styles
    "p-4",
    "space-y-2",
  ],
  {
    variants: {
      /**
       * Card variant
       */
      variant: {
        default: "",
        compact: "p-3 space-y-1",
        featured: "p-6 space-y-3",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * EventCard status variants using CVA (Class Variance Authority)
 */
export const eventCardStatusVariants = cva(
  [
    // Base styles
    "absolute",
    "top-2",
    "right-2",
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
       * Status
       */
      status: {
        "on-sale": "bg-brand-primary text-white shadow-primary",
        "sold-out": "bg-error-500 text-white",
        "coming-soon": "bg-surface-elevated border-border text-text-primary",
        "cancelled": "bg-muted border-border text-text-primary line-through",
      },
    },
    defaultVariants: {
      status: "on-sale",
    },
  }
);
