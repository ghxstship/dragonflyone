import { cva } from "class-variance-authority";

export const phoneInputVariants = cva(
  // Base styles
  "font-body px-4 py-3 h-11 border-2 rounded-r-[var(--radius-input)] transition-all duration-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex-1 min-w-0",
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
        class: "border-error-500 bg-surface-inverse text-text-primary placeholder:text-text-disabled",
      },
      // Error + Normal
      {
        error: true,
        inverted: false,
        class: "border-error-500 bg-white text-black placeholder:text-text-muted",
      },
      // Normal + Inverted
      {
        error: false,
        inverted: true,
        class: "border-border bg-surface-inverse text-text-primary placeholder:text-text-disabled border-l-0 hover:border-border-primary focus:border-[var(--color-primary-400)]",
      },
      // Normal + Normal
      {
        error: false,
        inverted: false,
        class: "border-border bg-surface-primary text-text-primary placeholder:text-text-muted border-l-0 hover:border-border-primary focus:border-[var(--color-primary-500)]",
      },
    ],
    defaultVariants: {
      error: false,
      inverted: false,
    },
  }
);

export const phoneInputSelectorVariants = cva(
  // Base styles
  "font-body px-3 py-3 h-11 border-2 rounded-l-[var(--radius-input)] transition-all duration-100 focus:outline-none cursor-pointer flex items-center gap-2 select-none",
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
        class: "border-error-500 bg-surface-inverse text-text-primary",
      },
      // Error + Normal
      {
        error: true,
        inverted: false,
        class: "border-error-500 bg-white text-black",
      },
      // Normal + Inverted
      {
        error: false,
        inverted: true,
        class: "border-border bg-surface-elevated text-text-primary hover:bg-surface-inverse",
      },
      // Normal + Normal
      {
        error: false,
        inverted: false,
        class: "border-border bg-muted text-text-primary hover:bg-surface-primary",
      },
    ],
    defaultVariants: {
      error: false,
      inverted: false,
    },
  }
);

export const phoneInputDropdownVariants = cva(
  // Base styles
  "absolute top-full left-0 mt-1 z-50 max-h-60 overflow-y-auto border-2 rounded-[var(--radius-card)] shadow-lg",
  {
    variants: {
      inverted: {
        true: "border-border bg-surface-inverse",
        false: "border-border bg-surface-primary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);
