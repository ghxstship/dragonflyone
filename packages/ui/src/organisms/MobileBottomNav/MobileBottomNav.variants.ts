import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const mobileBottomNavVariants = cva("fixed bottom-0 left-0 right-0 z-fixed md:hidden", {
  variants: {
    inverted: {
      true: "bg-surface-inverse border-border",
      false: "bg-surface-primary border-border",
    },
  },
  defaultVariants: {
    inverted: true,
  },
});

export type MobileBottomNavVariants = VariantProps<typeof mobileBottomNavVariants>;
