import { cva } from "class-variance-authority";

export const tabVariants = cva(
  "px-4 py-2 font-mono text-sm border-2 border-border rounded-badge transition-all duration-200",
  {
    variants: {
      active: {
        true: "border-primary bg-surface-primary text-primary shadow-primary",
        false: "border-border bg-surface-primary text-text-primary hover:bg-muted",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);
