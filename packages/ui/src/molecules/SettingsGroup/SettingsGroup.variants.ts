import { cva } from "class-variance-authority";

export const settingsGroupVariants = cva("bg-surface-primary border-2 border-border rounded-card p-6", {
  variants: {
    variant: {
      default: "",
      elevated: "shadow-primary bg-surface-elevated",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
