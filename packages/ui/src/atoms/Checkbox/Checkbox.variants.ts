import { cva } from "class-variance-authority";

/**
 * Checkbox variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 */
export const checkboxVariants = cva(
  [
    // Base styles
    "peer",
    "w-4 h-4 sm:w-5 sm:h-5",
    "border-2 appearance-none cursor-pointer relative",
    "rounded-[var(--radius-badge)]",
    "transition-all duration-[var(--duration-fast)] ease-[var(--easing-bounce)]",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    // Hover lift effect
    "hover:-translate-x-px hover:-translate-y-px",
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

export type CheckboxVariantProps = Parameters<typeof checkboxVariants>[0];

// Background image for the checkmark (using CSS custom properties)
export const checkboxCheckmarkImage = `
  url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 6L9 17L4 12' stroke='%23var(--color-surface-primary)' stroke-width='4' stroke-linecap='square' stroke-linejoin='miter'/%3E%3C/svg%3E")
`;
