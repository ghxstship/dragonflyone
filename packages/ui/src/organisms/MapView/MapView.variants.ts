import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const mapViewVariants = cva("flex rounded-lg border-2 overflow-hidden", {
  variants: {
    inverted: {
      true: "bg-surface-inverse border-border",
      false: "bg-surface-primary border-border",
    },
    loading: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    inverted: true,
    loading: false,
  },
});

export type MapViewVariants = VariantProps<typeof mapViewVariants>;
