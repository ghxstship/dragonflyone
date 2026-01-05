import { cva } from "class-variance-authority";

/**
 * ClientEventCard variants using CVA (Class Variance Authority)
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
export const clientEventCardVariants = cva(
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
       * Card status
       */
      status: {
        upcoming: "bg-surface-primary border-border",
        in_progress: "bg-brand-primary/10 border-brand-primary",
        completed: "bg-success-50 border-success-500",
        cancelled: "bg-error-50 border-error-500",
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
      status: "upcoming",
      inverted: false,
    },
    
    compoundVariants: [
      // Status combinations with inversion
      {
        status: "upcoming",
        inverted: true,
        class: "bg-surface-primary-inverse border-border-inverse",
      },
      {
        status: "upcoming",
        inverted: false,
        class: "bg-surface-primary border-border",
      },
      {
        status: "in_progress",
        inverted: true,
        class: "bg-brand-primary/20 border-brand-primary",
      },
      {
        status: "in_progress",
        inverted: false,
        class: "bg-brand-primary/10 border-brand-primary",
      },
      {
        status: "completed",
        inverted: true,
        class: "bg-success-900/20 border-success-400",
      },
      {
        status: "completed",
        inverted: false,
        class: "bg-success-50 border-success-500",
      },
      {
        status: "cancelled",
        inverted: true,
        class: "bg-error-900/20 border-error-400",
      },
      {
        status: "cancelled",
        inverted: false,
        class: "bg-error-50 border-error-500",
      },
    ],
  }
);

/**
 * ClientEventCard content variants using CVA (Class Variance Authority)
 */
export const clientEventCardContentVariants = cva(
  [
    // Base styles
    "p-6",
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
 * ClientEventCard header variants using CVA (Class Variance Authority)
 */
export const clientEventCardHeaderVariants = cva(
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
 * ClientEventCard title variants using CVA (Class Variance Authority)
 */
export const clientEventCardTitleVariants = cva(
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
 * ClientEventCard status badge variants using CVA (Class Variance Authority)
 */
export const clientEventCardStatusVariants = cva(
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
       * Card status
       */
      status: {
        upcoming: "bg-brand-primary/10 text-brand-primary border-2 border-brand-primary",
        in_progress: "bg-brand-primary text-white border-2 border-brand-primary animate-pulse",
        completed: "bg-success-500 text-white border-2 border-success-500",
        cancelled: "bg-error-500 text-white border-2 border-error-500",
      },
    },
    defaultVariants: {
      status: "upcoming",
    },
  }
);

/**
 * ClientEventCard details variants using CVA (Class Variance Authority)
 */
export const clientEventCardDetailsVariants = cva(
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
 * ClientEventCard detail item variants using CVA (Class Variance Authority)
 */
export const clientEventCardDetailItemVariants = cva(
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
 * ClientEventCard footer variants using CVA (Class Variance Authority)
 */
export const clientEventCardFooterVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-between",
    "pt-4",
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
 * ClientEventCard action button variants using CVA (Class Variance Authority)
 */
export const clientEventCardActionVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-2",
    "px-3",
    "py-1.5",
    "border-2",
    "rounded-button",
    "text-sm",
    "font-medium",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "hover:scale-105",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-surface-elevated-inverse border-border-inverse text-text-inverse hover:bg-surface-hover-inverse",
        false: "bg-surface-elevated border-border text-text-primary hover:bg-surface-hover",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);
