import { cva } from "class-variance-authority";

/**
 * Field variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Clear visual hierarchy
 * - Proper spacing
 * - Error state styling
 */
export const fieldVariants = cva(
  [
    // Base styles
    "flex",
    "flex-col",
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
 * Field label variants using CVA (Class Variance Authority)
 */
export const fieldLabelVariants = cva(
  [
    // Base styles
    "font-heading",
    "text-sm",
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
        true: "text-text-secondary-inverse",
        false: "text-text-primary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * Field required indicator variants using CVA (Class Variance Authority)
 */
export const fieldRequiredVariants = cva(
  [
    // Base styles
    "ml-1",
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
 * Field hint variants using CVA (Class Variance Authority)
 */
export const fieldHintVariants = cva(
  [
    // Base styles
    "font-mono",
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

/**
 * Field error variants using CVA (Class Variance Authority)
 */
export const fieldErrorVariants = cva(
  [
    // Base styles
    "font-mono",
    "text-xs",
    "uppercase",
    "tracking-widest",
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
        true: "text-error-400",
        false: "text-error-600",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);
