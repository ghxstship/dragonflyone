import { cva } from "class-variance-authority";

export const halftonePatternVariants = cva(
  // Base styles
  "",
  {
    variants: {
      pattern: {
        dots: "",
        lines: "",
        grid: "",
        diagonal: "",
      },
      overlay: {
        true: "relative",
        false: "w-full h-full",
      },
    },
    defaultVariants: {
      overlay: false,
    },
  }
);
