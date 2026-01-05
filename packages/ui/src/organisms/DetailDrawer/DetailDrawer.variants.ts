import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const detailDrawerVariants = cva("", {
  variants: {
    width: {
      sm: "",
      md: "",
      lg: "",
      xl: "",
    },
    position: {
      left: "",
      right: "",
    },
    splitPane: {
      true: "",
      false: "",
    },
    loading: {
      true: "",
      false: "",
    },
    inverted: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    width: "md",
    position: "right",
    splitPane: false,
    loading: false,
    inverted: false,
  },
});

export type DetailDrawerVariants = VariantProps<typeof detailDrawerVariants>;
