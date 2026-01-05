import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const globalSearchVariants = cva("", {
  variants: {
    open: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    open: false,
  },
});

export type GlobalSearchVariants = VariantProps<typeof globalSearchVariants>;
