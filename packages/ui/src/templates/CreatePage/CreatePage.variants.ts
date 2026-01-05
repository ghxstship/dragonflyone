import { cva } from "class-variance-authority";

export const createPageVariants = cva(
  // Base styles
  "min-h-screen bg-surface-primary",
  {
    variants: {
      inverted: {
        true: "bg-surface-inverse text-text-primary",
        false: "bg-surface-primary text-text-primary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

export const createPageHeaderVariants = cva(
  // Base styles
  "border-b bg-surface-elevated transition-colors",
  {
    variants: {
      inverted: {
        true: "border-border-inverse bg-surface-elevated",
        false: "border-border bg-surface-elevated",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

export const createPageContentVariants = cva(
  // Base styles
  "py-6 transition-colors",
  {
    variants: {
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
