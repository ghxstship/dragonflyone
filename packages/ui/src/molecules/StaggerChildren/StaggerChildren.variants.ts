import { cva } from "class-variance-authority";

export const staggerChildrenVariants = cva("block", {
  variants: {
    variant: {
      default: "",
      fadeIn: "",
      slideUp: "",
      scaleIn: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
