import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const automationBuilderVariants = cva("w-full max-w-6xl mx-auto p-spacing-6", {
  variants: {
    variant: {
      default: "",
      compact: "",
      expanded: "",
    },
    enabled: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    enabled: true,
  },
});

export type AutomationBuilderVariants = VariantProps<typeof automationBuilderVariants>;
