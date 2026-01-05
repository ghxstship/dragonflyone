import { cva } from "class-variance-authority";

export const kickerVariants = cva(
  // Base styles
  "font-code uppercase font-bold",
  {
    variants: {
      size: {
        sm: "text-[10px] tracking-[0.2em]",
        md: "text-xs tracking-[0.15em]",
        lg: "text-sm tracking-[0.1em]",
      },
      variant: {
        default: "",
        muted: "",
        accent: "",
      },
      colorScheme: {
        "on-dark": {
          default: "text-text-muted",
          muted: "text-text-muted",
          accent: "text-text-secondary",
        },
        "on-light": {
          default: "text-text-muted",
          muted: "text-text-muted",
          accent: "text-text-muted",
        },
        "on-mid": {
          default: "text-white",
          muted: "text-text-secondary",
          accent: "text-white",
        },
      },
    },
    compoundVariants: [
      // on-dark combinations
      {
        colorScheme: "on-dark",
        variant: "default",
        class: "text-text-muted",
      },
      {
        colorScheme: "on-dark",
        variant: "muted",
        class: "text-text-muted",
      },
      {
        colorScheme: "on-dark",
        variant: "accent",
        class: "text-text-secondary",
      },
      // on-light combinations
      {
        colorScheme: "on-light",
        variant: "default",
        class: "text-text-muted",
      },
      {
        colorScheme: "on-light",
        variant: "muted",
        class: "text-text-muted",
      },
      {
        colorScheme: "on-light",
        variant: "accent",
        class: "text-text-muted",
      },
      // on-mid combinations
      {
        colorScheme: "on-mid",
        variant: "default",
        class: "text-white",
      },
      {
        colorScheme: "on-mid",
        variant: "muted",
        class: "text-text-secondary",
      },
      {
        colorScheme: "on-mid",
        variant: "accent",
        class: "text-white",
      },
    ],
    defaultVariants: {
      size: "md",
      variant: "default",
      colorScheme: "on-dark",
    },
  }
);
