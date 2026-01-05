import { cva } from "class-variance-authority";

export const dividerVariants = cva(
  // Base styles
  "border-0",
  {
    variants: {
      orientation: {
        horizontal: "w-full",
        vertical: "h-full",
      },
      weight: {
        thin: "",
        medium: "",
        thick: "",
      },
      inverted: {
        true: "border-border",
        false: "border-border",
      },
    },
    compoundVariants: [
      {
        orientation: "horizontal",
        weight: "thin",
        class: "border-t",
      },
      {
        orientation: "horizontal",
        weight: "medium",
        class: "border-t-2",
      },
      {
        orientation: "horizontal",
        weight: "thick",
        class: "border-t-4",
      },
      {
        orientation: "vertical",
        weight: "thin",
        class: "border-l",
      },
      {
        orientation: "vertical",
        weight: "medium",
        class: "border-l-2",
      },
      {
        orientation: "vertical",
        weight: "thick",
        class: "border-l-4",
      },
    ],
    defaultVariants: {
      orientation: "horizontal",
      weight: "medium",
      inverted: false,
    },
  }
);
