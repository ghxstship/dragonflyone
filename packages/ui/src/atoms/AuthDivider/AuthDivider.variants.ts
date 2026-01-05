import { cva } from "class-variance-authority";

export const authDividerVariants = cva("my-6", {
  variants: {
    variant: {
      default: "",
      compact: "my-4",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
