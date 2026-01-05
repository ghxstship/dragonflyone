import { cva } from "class-variance-authority";

/**
 * Textarea variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 */
export const textareaVariants = cva(
  [
    // Base styles
    "font-body",
    "px-3 py-2 min-h-[100px] text-sm resize-y",
    "sm:px-4 sm:py-3 sm:min-h-[120px] sm:text-base",
    "border-2 rounded-[var(--radius-input)]",
    "transition-all duration-[var(--duration-fast)] ease-[var(--easing-easeOut)]",
    "focus:outline-none focus:-translate-x-px focus:-translate-y-px",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    // Placeholder styling
    "placeholder:text-[var(--color-text-disabled)]",
  ],
  {
    variants: {
      error: {
        true: [
          "border-[var(--color-error-border)]",
          "bg-[var(--color-surface-input-error)]",
          "text-[var(--color-text-primary)]",
          "shadow-[var(--shadow-xs)]",
          "focus:border-[var(--color-error-border-hover)] focus:shadow-[var(--shadow-sm)]",
        ],
        false: [
          "border-[var(--color-border-input)]",
          "bg-[var(--color-surface-input)]",
          "text-[var(--color-text-primary)]",
          "shadow-[var(--shadow-xs)]",
          "hover:border-[var(--color-border-input-hover)]",
          "focus:border-[var(--color-brand-primary)] focus:shadow-[var(--shadow-sm)]",
        ],
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
    },
    defaultVariants: {
      error: false,
      fullWidth: false,
    },
  }
);

export type TextareaVariantProps = Parameters<typeof textareaVariants>[0];
