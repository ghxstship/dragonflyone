import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const marketingPageVariants = cva("min-h-screen bg-surface-primary", {
  variants: {
    variant: {
      default: "",
      inverted: "bg-surface-inverse",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type MarketingPageVariants = VariantProps<typeof marketingPageVariants>;
