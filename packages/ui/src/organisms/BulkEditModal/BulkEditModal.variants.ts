import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const bulkEditModalVariants = cva("", {
  variants: {
    size: {
      sm: "",
      md: "",
      lg: "",
    },
    inverted: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    size: "md",
    inverted: false,
  },
});

export type BulkEditModalVariants = VariantProps<typeof bulkEditModalVariants>;
