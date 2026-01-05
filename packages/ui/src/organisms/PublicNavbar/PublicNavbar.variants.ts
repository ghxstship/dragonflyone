import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const publicNavbarVariants = cva("sticky top-0 z-modal border-b-2", {
  variants: {
    inverted: {
      true: "border-border bg-surface-inverse",
      false: "border-border bg-surface-primary",
    },
  },
  defaultVariants: {
    inverted: true,
  },
});

export type PublicNavbarVariants = VariantProps<typeof publicNavbarVariants>;
