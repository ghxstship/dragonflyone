import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const contentLayoutVariants = cva("", {
  variants: {
    inverted: {
      true: "",
      false: "",
    },
    padding: {
      none: "",
      sm: "",
      md: "",
      lg: "",
    },
    sidePosition: {
      left: "",
      right: "",
    },
    sideWidth: {
      sm: "",
      md: "",
      lg: "",
      xl: "",
    },
    direction: {
      horizontal: "",
      vertical: "",
    },
    gap: {
      none: "",
      sm: "",
      md: "",
      lg: "",
    },
    position: {
      top: "",
      bottom: "",
    },
    priority: {
      low: "",
      medium: "",
      high: "",
      urgent: "",
    },
  },
  defaultVariants: {
    inverted: true,
    padding: "md",
    sidePosition: "right",
    sideWidth: "md",
    direction: "vertical",
    gap: "md",
    position: "top",
  },
});

export type ContentLayoutVariants = VariantProps<typeof contentLayoutVariants>;
