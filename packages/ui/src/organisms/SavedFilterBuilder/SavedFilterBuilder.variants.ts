import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const savedFilterBuilderVariants = cva("space-y-spacing-4", {
  variants: {
    depth: {
      0: "",
      1: "",
      2: "",
    },
  },
  defaultVariants: {
    depth: 0,
  },
});

export const filterGroupVariants = cva("p-spacing-4 border-2 rounded-card", {
  variants: {
    depth: {
      0: "border-border-primary bg-surface-primary",
      1: "border-border bg-surface-secondary",
      2: "border-border bg-surface-secondary",
    },
  },
  defaultVariants: {
    depth: 0,
  },
});

export type SavedFilterBuilderVariants = VariantProps<typeof savedFilterBuilderVariants>;
export type FilterGroupVariants = VariantProps<typeof filterGroupVariants>;
