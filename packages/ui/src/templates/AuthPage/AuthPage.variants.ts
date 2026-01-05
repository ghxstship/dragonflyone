import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const authPageVariants = cva("flex min-h-screen flex-col", {
  variants: {
    background: {
      white: "bg-white text-black",
      black: "bg-black text-white",
      ink: "bg-surface-inverse text-text-primary",
    },
    inverted: {
      true: "bg-surface-inverse text-text-primary",
      false: "bg-white text-black",
    },
  },
  defaultVariants: {
    background: "ink",
    inverted: true,
  },
});

export type AuthPageVariants = VariantProps<typeof authPageVariants>;
