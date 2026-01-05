import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const presenceAvatarsVariants = cva("flex items-center", {
  variants: {
    size: {
      sm: "avatar-sm",
      md: "avatar-md",
      lg: "avatar-lg",
    },
    inverted: {
      true: "inverted",
      false: "",
    },
  },
  defaultVariants: {
    size: "md",
    inverted: false,
  },
});

export type PresenceAvatarsVariants = VariantProps<typeof presenceAvatarsVariants>;
