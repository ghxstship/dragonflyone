import { cva } from "class-variance-authority";

export const passwordRequirementsVariants = cva("space-y-2", {
  variants: {
    variant: {
      default: "",
      compact: "space-y-1",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
