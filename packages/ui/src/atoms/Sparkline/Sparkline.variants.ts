import { cva } from "class-variance-authority";

export const sparklineVariants = cva(
  // Base styles
  "inline-block",
  {
    variants: {
      variant: {
        default: "",
        success: "",
        error: "",
        warning: "",
        info: "",
      },
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      inverted: false,
    },
  }
);
