import { cva } from "class-variance-authority";

export const socialAuthButtonGroupVariants = cva("w-full", {
  variants: {
    variant: {
      default: "",
      compact: "space-y-2",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
