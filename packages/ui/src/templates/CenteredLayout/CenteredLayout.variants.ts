import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const centeredLayoutVariants = cva("min-h-screen flex flex-col", {
  variants: {
    align: {
      "vertical-center": "",
      "top-aligned": "",
    },
    container: {
      card: "",
      none: "",
    },
    background: {
      none: "",
      "full-bleed": "",
      split: "",
      pattern: "",
    },
    width: {
      narrow: "",
      medium: "",
      wide: "",
    },
    pattern: {
      grid: "",
      halftone: "",
      none: "",
    },
    inverted: {
      true: "bg-surface-inverse text-text-primary",
      false: "bg-surface-primary text-text-primary",
    },
    loading: {
      true: "",
      false: "",
    },
    error: {
      true: "",
      false: "",
    },
    empty: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    align: "vertical-center",
    container: "none",
    background: "none",
    width: "medium",
    pattern: "grid",
    inverted: true,
    loading: false,
    error: false,
    empty: false,
  },
});

export type CenteredLayoutVariants = VariantProps<typeof centeredLayoutVariants>;
