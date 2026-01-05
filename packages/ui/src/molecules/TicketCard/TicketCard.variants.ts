import { cva } from "class-variance-authority";

/**
 * TicketCard variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Ticket card with QR code and status
 */
export const ticketCardVariants = cva(
  [
    // Base styles
    "border-2",
    "rounded-[var(--radius-card)]",
    "shadow-hard",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "hover:scale-105",
    "hover:shadow-hard",
    "cursor-pointer",
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
 * TicketCard header variants using CVA (Class Variance Authority)
 */
export const ticketCardHeaderVariants = cva(
  [
    // Base styles
    "p-4",
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
 * TicketCard content variants using CVA (Class Variance Authority)
 */
export const ticketCardContentVariants = cva(
  [
    // Base styles
    "p-4",
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
 * TicketCard title variants using CVA (Class Variance Authority)
 */
export const ticketCardTitleVariants = cva(
  [
    // Base styles
    "font-bold",
    "text-lg",
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
        true: "text-text-primary-inverse",
        false: "text-text-primary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * TicketCard info variants using CVA (Class Variance Authority)
 */
export const ticketCardInfoVariants = cva(
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
 * TicketCard status variants using CVA (Class Variance Authority)
 */
export const ticketCardStatusVariants = cva(
  [
    // Base styles
    "inline-flex",
    "items-center",
    "px-2",
    "py-1",
    "text-xs",
    "font-medium",
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
        valid: "bg-success-500 text-white",
        used: "bg-muted-foreground text-text-primary",
        transferred: "bg-muted-foreground text-text-primary",
        refunded: "bg-error-500 text-white",
        expired: "bg-muted text-text-muted",
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
      status: "valid",
      inverted: false,
    },
    
    compoundVariants: [
      // Status with inversion combinations
      {
        status: "valid",
        inverted: true,
        class: "bg-success-500 text-white",
      },
      {
        status: "used",
        inverted: true,
        class: "bg-muted-foreground text-text-primary",
      },
      {
        status: "transferred",
        inverted: true,
        class: "bg-muted-foreground text-text-primary",
      },
      {
        status: "refunded",
        inverted: true,
        class: "bg-error-500 text-white",
      },
      {
        status: "expired",
        inverted: true,
        class: "bg-muted text-text-muted-inverse",
      },
    ],
  }
);

/**
 * TicketCard QR code container variants using CVA (Class Variance Authority)
 */
export const ticketCardQRContainerVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-center",
    "p-4",
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
        true: "bg-surface-elevated-inverse",
        false: "bg-surface-elevated",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * TicketCard QR code variants using CVA (Class Variance Authority)
 */
export const ticketCardQRVariants = cva(
  [
    // Base styles
    "w-32",
    "h-32",
    "border-2",
    "rounded-button",
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
