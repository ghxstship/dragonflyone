import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const authSplitLayoutVariants = cva("flex flex-col h-screen overflow-hidden", {
  variants: {
    singleColumn: {
      true: "",
      false: "",
    },
    brandBackground: {
      gradient: "bg-primary-600",
      pattern: "bg-surface-inverse bg-halftone",
      solid: "bg-primary-600",
      image: "bg-surface-inverse",
    },
  },
  defaultVariants: {
    singleColumn: false,
    brandBackground: "gradient",
  },
});

export type AuthSplitLayoutVariants = VariantProps<typeof authSplitLayoutVariants>;
