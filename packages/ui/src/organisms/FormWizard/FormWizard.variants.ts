import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const formWizardVariants = cva("w-full", {
  variants: {
    size: {
      sm: "",
      md: "",
      lg: "",
    },
    inverted: {
      true: "",
      false: "",
    },
    showProgress: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    size: "md",
    inverted: false,
    showProgress: true,
  },
});

export type FormWizardVariants = VariantProps<typeof formWizardVariants>;
