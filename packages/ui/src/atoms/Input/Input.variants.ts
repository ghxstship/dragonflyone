import { cva } from "class-variance-authority";

/**
 * Input variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 */
export const inputVariants = cva(
  [
    "font-sans",
    "border-2",
    "rounded-[var(--radius-md)]",
    "transition-all duration-[var(--duration-fast)] ease-[var(--easing-easeOut)]",
    "focus:outline-none focus:ring-2 focus:ring-offset-1",
    "focus:ring-[var(--color-brand-primary)]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "placeholder:text-[var(--color-text-tertiary)]",
  ],
  {
    variants: {
      inputSize: {
        sm: "px-2 py-1.5 h-8 text-xs",
        md: "px-3 py-2 h-10 text-sm",
        lg: "px-4 py-3 h-12 text-base",
      },
      error: {
        true: [
          "border-[var(--color-error)]",
          "bg-[var(--color-surface-input)]",
          "text-[var(--color-text-primary)]",
          "focus:ring-[var(--color-error)]",
          "focus:border-[var(--color-error)]",
        ],
        false: [
          "border-[var(--color-border-default)]",
          "bg-[var(--color-surface-input)]",
          "text-[var(--color-text-primary)]",
          "hover:border-[var(--color-border-strong)]",
          "focus:border-[var(--color-brand-primary)]",
        ],
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
    },
    defaultVariants: {
      inputSize: "md",
      error: false,
      fullWidth: false,
    },
  }
);

export type InputVariantProps = Parameters<typeof inputVariants>[0];
