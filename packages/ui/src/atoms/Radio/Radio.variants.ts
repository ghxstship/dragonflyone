import { cva } from "class-variance-authority";

/**
 * Radio variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 */
export const radioVariants = cva(
  [
    // Base styles
    "peer",
    "w-4 h-4 sm:w-5 sm:h-5",
    "border-2 appearance-none cursor-pointer relative",
    "rounded-[var(--radius-circle)]",
    "transition-all duration-[var(--duration-fast)] ease-[var(--easing-bounce)]",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    // Hover lift effect
    "hover:-translate-x-px hover:-translate-y-px",
    // Active press
    "active:translate-x-0 active:translate-y-0",
    // Inner dot indicator
    "after:content-['']",
    "after:absolute after:inset-[4px] sm:after:inset-[5px]",
    "after:rounded-[var(--radius-circle)]",
    "after:opacity-0 after:scale-0",
    "after:transition-all after:duration-[var(--duration-fast)] after:ease-[var(--easing-bounce)]",
  ],
  {
    variants: {
      checked: {
        true: [
          "bg-[var(--color-brand-primary)]",
          "border-[var(--color-brand-primary)]",
          "shadow-[var(--shadow-sm)]",
          "checked:hover:shadow-[var(--shadow-md)]",
          "after:opacity-100 after:scale-100",
          "after:bg-[var(--color-surface-primary)]",
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

export type RadioVariantProps = Parameters<typeof radioVariants>[0];
