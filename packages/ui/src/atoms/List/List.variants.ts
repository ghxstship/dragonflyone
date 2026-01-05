import { cva } from "class-variance-authority";

export const listVariants = cva(
  // Base styles
  "",
  {
    variants: {
      variant: {
        default: "",
        none: "list-none",
        disc: "list-disc",
        decimal: "list-decimal",
        check: "list-none",
      },
      spacing: {
        none: "space-y-spacing-0",
        sm: "space-y-spacing-1",
        md: "space-y-spacing-2",
        lg: "space-y-spacing-4",
      },
    },
    compoundVariants: [
      {
        variant: ["default", "disc", "decimal"],
        class: "pl-spacing-4",
      },
    ],
    defaultVariants: {
      variant: "default",
      spacing: "sm",
    },
  }
);

export const listItemVariants = cva(
  // Base styles
  "",
  {
    variants: {
      hasIcon: {
        true: "flex gap-gap-xs items-start",
        false: "",
      },
    },
    defaultVariants: {
      hasIcon: false,
    },
  }
);
