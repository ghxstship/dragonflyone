import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const virtualizedListVariants = cva("relative overflow-hidden", {
  variants: {
    inverted: {
      true: "inverted",
      false: "",
    },
  },
  defaultVariants: {
    inverted: false,
  },
});

export type VirtualizedListVariants = VariantProps<typeof virtualizedListVariants>;
