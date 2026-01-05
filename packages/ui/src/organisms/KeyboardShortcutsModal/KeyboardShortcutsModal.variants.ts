import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const keyboardShortcutsModalVariants = cva("", {
  variants: {
    size: {
      sm: "",
      md: "",
      lg: "",
      xl: "",
    },
  },
  defaultVariants: {
    size: "lg",
  },
});

export type KeyboardShortcutsModalVariants = VariantProps<typeof keyboardShortcutsModalVariants>;
