import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const timelineViewVariants = cva("space-y-8", {
  variants: {
    inverted: {
      true: "",
      false: "",
    },
    loading: {
      true: "",
      false: "",
    },
    empty: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    inverted: true,
    loading: false,
    empty: false,
  },
});

export type TimelineViewVariants = VariantProps<typeof timelineViewVariants>;
