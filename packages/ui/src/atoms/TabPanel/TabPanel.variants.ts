import { cva } from "class-variance-authority";

export const tabPanelVariants = cva("w-full", {
  variants: {
    variant: {
      default: "",
      padded: "p-4",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
