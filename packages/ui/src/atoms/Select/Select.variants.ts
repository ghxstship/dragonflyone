import { cva } from "class-variance-authority";

/**
 * Select variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 */
export const selectVariants = cva(
  [
    // Base styles
    "font-body",
    "px-3 py-2 pr-8 h-10 text-sm",
    "sm:px-4 sm:py-3 sm:pr-10 sm:h-11 sm:text-base",
    "border-2",
    "rounded-[var(--radius-input)]",
    "appearance-none bg-no-repeat bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center]",
    "transition-all duration-[var(--duration-fast)] ease-[var(--easing-easeOut)]",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "focus:ring-[var(--color-brand-primary)]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ],
  {
    variants: {
      error: {
        true: [
          "border-[var(--color-error-border)]",
          "bg-[var(--color-surface-input-error)]",
          "text-[var(--color-text-primary)]",
          "focus:ring-[var(--color-error-border)]",
        ],
        false: [
          "border-[var(--color-border-input)]",
          "bg-[var(--color-surface-input)]",
          "text-[var(--color-text-primary)]",
          "hover:border-[var(--color-border-input-hover)]",
          "focus:border-[var(--color-brand-primary)]",
        ],
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      error: false,
      fullWidth: false,
    },
  }
);

export type SelectVariantProps = Parameters<typeof selectVariants>[0];

// Background image for the chevron (using CSS custom properties)
export const selectBackgroundImage = `
  url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9L12 15L18 9' stroke='%23var(--color-text-secondary)' stroke-width='3' stroke-linecap='square' stroke-linejoin='miter'/%3E%3C/svg%3E")
`;
