import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const appNavigationVariants = cva("sticky top-0 z-modal border-b backdrop-blur", {
  variants: {
    colorScheme: {
      ink: "bg-surface-inverse/90 border-border",
      black: "bg-black/90 border-border",
    },
    variant: {
      default: "",
      transparent: "",
    },
  },
  defaultVariants: {
    colorScheme: "ink",
    variant: "default",
  },
});

export type AppNavigationVariants = VariantProps<typeof appNavigationVariants>;
