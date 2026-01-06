import { cva } from "class-variance-authority";

export const stateContentVariants = cva(
  "flex-1 flex items-center justify-center p-8 min-h-[400px]",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
