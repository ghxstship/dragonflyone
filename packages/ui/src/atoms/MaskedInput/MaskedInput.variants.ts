import { cva } from "class-variance-authority";

export const maskedInputVariants = cva(
  // Base styles
  "w-full px-4 py-3 font-body text-sm border-2 rounded-[var(--radius-input)] transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      inverted: {
        true: "bg-surface-inverse text-text-primary placeholder:text-text-disabled",
        false: "bg-surface-primary text-text-primary placeholder:text-text-muted",
      },
      error: {
        true: "border-error-500 focus:ring-error-500",
        false: "",
      },
    },
    compoundVariants: [
      {
        inverted: true,
        error: false,
        class: "border-border focus:border-on-dark-primary focus:ring-on-dark-primary",
      },
      {
        inverted: false,
        error: false,
        class: "border-border focus:border-on-light-primary focus:ring-on-light-primary",
      },
    ],
    defaultVariants: {
      inverted: false,
      error: false,
    },
  }
);
