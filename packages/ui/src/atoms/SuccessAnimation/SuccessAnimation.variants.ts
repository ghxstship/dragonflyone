import { cva } from "class-variance-authority";

export const successAnimationVariants = cva(
  // Base styles
  "flex items-center justify-center",
  {
    variants: {
      size: {
        sm: "w-8 h-8",
        md: "w-12 h-12", 
        lg: "w-16 h-16",
      },
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      inverted: false,
    },
  }
);
