import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const pageHeaderVariants = cva("border-b-2", {
  variants: {
    sticky: {
      true: "sticky top-0 z-sticky-header",
      false: "",
    },
    inverted: {
      true: "bg-surface-inverse border-border",
      false: "bg-surface-primary border-border",
    },
  },
  defaultVariants: {
    sticky: true,
    inverted: true,
  },
});

export type PageHeaderVariants = VariantProps<typeof pageHeaderVariants>;
