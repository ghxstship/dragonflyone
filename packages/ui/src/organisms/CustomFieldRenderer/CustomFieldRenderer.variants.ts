import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const customFieldRendererVariants = cva("space-y-spacing-1", {
  variants: {
    compact: {
      true: "",
      false: "",
    },
    disabled: {
      true: "",
      false: "",
    },
    error: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    compact: false,
    disabled: false,
    error: false,
  },
});

export const customFieldGroupVariants = cva("grid gap-gap-md", {
  variants: {
    columns: {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    },
  },
  defaultVariants: {
    columns: 1,
  },
});

export type CustomFieldRendererVariants = VariantProps<typeof customFieldRendererVariants>;
export type CustomFieldGroupVariants = VariantProps<typeof customFieldGroupVariants>;
