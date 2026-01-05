import { cva } from "class-variance-authority";

export const footerColumnVariants = cva("flex flex-col", {
  variants: {
    variant: {
      default: "",
      compact: "gap-2",
      spacious: "gap-6",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
