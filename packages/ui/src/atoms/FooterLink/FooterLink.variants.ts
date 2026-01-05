import { cva } from "class-variance-authority";

export const footerLinkVariants = cva(
  "text-sm text-text-muted hover:text-text-primary transition-colors duration-200 font-mono",
  {
    variants: {
      variant: {
        default: "",
        bold: "font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
