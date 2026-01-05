import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const apiErrorBoundaryVariants = cva("flex min-h-panel-sm items-center justify-center p-spacing-6", {
  variants: {
    variant: {
      default: "",
      compact: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type ApiErrorBoundaryVariants = VariantProps<typeof apiErrorBoundaryVariants>;
