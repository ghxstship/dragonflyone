import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const scrollableTableWrapperVariants = cva("relative", {
  variants: {
    showHint: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    showHint: true,
  },
});

export type ScrollableTableWrapperVariants = VariantProps<typeof scrollableTableWrapperVariants>;
