import { cva } from "class-variance-authority";

export const formVariants = cva(
  // Base styles
  "flex flex-col",
  {
    variants: {
      gap: {
        2: "gap-2",
        4: "gap-4", 
        6: "gap-6",
        8: "gap-8",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
    },
    defaultVariants: {
      gap: 6,
      fullWidth: true,
    },
  }
);
