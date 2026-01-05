import { cva } from "class-variance-authority";

/**
 * Switch variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 */
export const switchTrackVariants = cva(
  [
    // Base track styles
    "w-9 h-5 sm:w-11 sm:h-6",
    "border-2 rounded-[var(--radius-circle)]",
    "transition-all duration-[var(--duration-fast)] ease-[var(--easing-bounce)]",
    "peer-focus:ring-2 peer-focus:ring-offset-2",
    "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
  ],
  {
    variants: {
      checked: {
        true: [
          "bg-[var(--color-brand-primary)]",
          "border-[var(--color-brand-primary)]",
          "shadow-[var(--shadow-sm)]",
        ],
        false: [
          "bg-transparent",
          "border-[var(--color-border-input)]",
          "shadow-[var(--shadow-xs)]",
        ],
      },
    },
    defaultVariants: {
      checked: false,
    },
  }
);

export const switchThumbVariants = cva(
  [
    // Base thumb styles
    "absolute left-0.5 top-0.5",
    "w-3 h-3 sm:w-4 sm:h-4",
    "rounded-[var(--radius-circle)]",
    "transition-all duration-[var(--duration-fast)] ease-[var(--easing-bounce)]",
    "peer-checked:translate-x-4 sm:peer-checked:translate-x-5",
    "group-hover:scale-110",
    "group-active:scale-95",
  ],
  {
    variants: {
      checked: {
        true: [
          "bg-[var(--color-surface-primary)]",
          "border-2 border-[var(--color-surface-primary)]",
        ],
        false: [
          "bg-[var(--color-surface-elevated)]",
          "border-2 border-[var(--color-border-input)]",
        ],
      },
    },
    defaultVariants: {
      checked: false,
    },
  }
);

export type SwitchTrackVariantProps = Parameters<typeof switchTrackVariants>[0];
export type SwitchThumbVariantProps = Parameters<typeof switchThumbVariants>[0];
