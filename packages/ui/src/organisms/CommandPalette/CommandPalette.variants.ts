import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const commandPaletteVariants = cva("", {
  variants: {
    inverted: {
      true: "",
      false: "",
    },
    open: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    inverted: true,
    open: false,
  },
});

export type CommandPaletteVariants = VariantProps<typeof commandPaletteVariants>;
