import { cva } from "class-variance-authority";

/**
 * SettingsRow variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Settings row with label, description, and control
 */
export const settingsRowVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-between",
    "p-4",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Border state
       */
      bordered: {
        true: "border-b-2",
        false: "",
      },
      
      /**
       * Disabled state
       */
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "hover:bg-surface-hover",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-surface-primary-inverse",
        false: "bg-surface-primary",
      },
    },
    defaultVariants: {
      bordered: false,
      disabled: false,
      inverted: false,
    },
    
    compoundVariants: [
      // Border with inversion combinations
      {
        bordered: true,
        inverted: true,
        class: "border-border-inverse",
      },
      {
        bordered: true,
        inverted: false,
        class: "border-border",
      },
    ],
  }
);

/**
 * SettingsRow content container variants using CVA (Class Variance Authority)
 */
export const settingsRowContentContainerVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-3",
    "flex-1",
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
 * SettingsRow icon variants using CVA (Class Variance Authority)
 */
export const settingsRowIconVariants = cva(
  [
    // Base styles
    "w-5",
    "h-5",
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
 * SettingsRow text container variants using CVA (Class Variance Authority)
 */
export const settingsRowTextContainerVariants = cva(
  [
    // Base styles
    "flex-1",
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
 * SettingsRow label variants using CVA (Class Variance Authority)
 */
export const settingsRowLabelVariants = cva(
  [
    // Base styles
    "text-sm",
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
 * SettingsRow description variants using CVA (Class Variance Authority)
 */
export const settingsRowDescriptionVariants = cva(
  [
    // Base styles
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
 * SettingsRow control container variants using CVA (Class Variance Authority)
 */
export const settingsRowControlContainerVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
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
