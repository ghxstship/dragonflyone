import { cva } from "class-variance-authority";

export const passwordInputVariants = cva(
  // Base styles
  "h-10 sm:h-11 border-2 px-3 py-2 pr-10 sm:px-4 sm:py-3 sm:pr-12 font-body text-sm sm:text-base rounded-[var(--radius-input)] transition-all duration-100 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 w-full",
  {
    variants: {
      error: {
        true: "",
        false: "",
      },
      inverted: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      // Error + Inverted
      {
        error: true,
        inverted: true,
        class: "border-error-500 bg-surface-inverse text-text-primary placeholder:text-text-disabled shadow-[2px_2px_0_rgba(239,68,68,0.3)] focus:border-error-400 focus:shadow-[3px_3px_0_rgba(239,68,68,0.4)]",
      },
      // Error + Normal
      {
        error: true,
        inverted: false,
        class: "border-error-500 bg-white text-black placeholder:text-text-muted shadow-[2px_2px_0_rgba(239,68,68,0.2)] focus:border-error-600 focus:shadow-[3px_3px_0_rgba(239,68,68,0.3)]",
      },
      // Normal + Inverted
      {
        error: false,
        inverted: true,
        class: "border-border bg-surface-inverse text-text-primary placeholder:text-text-disabled shadow-[2px_2px_0_rgba(255,255,255,0.1)] hover:border-border-primary focus:-translate-x-px focus:-translate-y-px focus:border-[var(--color-primary-400)] focus:shadow-[3px_3px_0_var(--color-primary-300)]",
      },
      // Normal + Normal
      {
        error: false,
        inverted: false,
        class: "border-border bg-surface-primary text-text-primary placeholder:text-text-muted shadow-[2px_2px_0_rgba(0,0,0,0.08)] hover:border-border-primary focus:-translate-x-px focus:-translate-y-px focus:border-[var(--color-primary-500)] focus:shadow-[3px_3px_0_var(--color-primary-200)]",
      },
    ],
    defaultVariants: {
      error: false,
      inverted: false,
    },
  }
);

export const passwordInputButtonVariants = cva(
  // Base styles
  "absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 transition-colors duration-100 focus:outline-none focus:ring-2 focus:ring-offset-1",
  {
    variants: {
      inverted: {
        true: "text-text-muted hover:text-white focus:ring-[var(--color-primary-400)] focus:ring-offset-ink-900",
        false: "text-text-disabled hover:text-black focus:ring-[var(--color-primary-500)] focus:ring-offset-white",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);
