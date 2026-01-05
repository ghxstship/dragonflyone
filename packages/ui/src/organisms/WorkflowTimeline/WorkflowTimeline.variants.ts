import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const workflowTimelineVariants = cva("", {
  variants: {
    variant: {
      vertical: "",
      horizontal: "",
    },
    cardVariant: {
      bordered: "border border-border",
      surface: "surface",
    },
  },
  defaultVariants: {
    variant: "vertical",
    cardVariant: "bordered",
  },
});

export type WorkflowTimelineVariants = VariantProps<typeof workflowTimelineVariants>;
