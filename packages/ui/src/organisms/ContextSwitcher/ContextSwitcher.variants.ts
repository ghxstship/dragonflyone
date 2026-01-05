import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const contextSwitcherVariants = cva("", {
  variants: {
    contextLevel: {
      platform: "",
      production: "",
    },
    inverted: {
      true: "",
      false: "",
    },
    size: {
      sm: "",
      md: "",
      lg: "",
    },
  },
  defaultVariants: {
    contextLevel: "platform",
    inverted: true,
    size: "md",
  },
});

export type ContextSwitcherVariants = VariantProps<typeof contextSwitcherVariants>;
