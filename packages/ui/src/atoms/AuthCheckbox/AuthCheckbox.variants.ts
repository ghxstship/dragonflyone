import { cva } from "class-variance-authority";

export const authCheckboxVariants = cva("block cursor-pointer", {
  variants: {
    variant: {
      default: "",
      compact: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
