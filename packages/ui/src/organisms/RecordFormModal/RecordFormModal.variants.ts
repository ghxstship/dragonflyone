import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const recordFormModalVariants = cva("", {
  variants: {
    size: {
      sm: "max-w-md",
      md: "max-w-2xl", 
      lg: "max-w-4xl",
      xl: "max-w-6xl",
    },
    mode: {
      create: "",
      edit: "",
    },
  },
  defaultVariants: {
    size: "md",
    mode: "create",
  },
});

export type RecordFormModalVariants = VariantProps<typeof recordFormModalVariants>;
