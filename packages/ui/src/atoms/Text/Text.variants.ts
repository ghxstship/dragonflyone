import { cva } from "class-variance-authority";

export const textVariants = cva(
  // Base styles
  "",
  {
    variants: {
      variant: {
        default: "",
        muted: "",
        mono: "",
        accent: "",
      },
      size: {
        xs: "text-xs",
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
        xl: "text-xl",
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
      },
      inverted: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      // Default + Inverted
      {
        variant: "default",
        inverted: true,
        class: "text-current",
      },
      {
        variant: "default",
        inverted: false,
        class: "text-text-primary",
      },
      // Muted + Inverted
      {
        variant: "muted",
        inverted: true,
        class: "text-text-muted",
      },
      {
        variant: "muted",
        inverted: false,
        class: "text-text-muted",
      },
      // Mono + Inverted
      {
        variant: "mono",
        inverted: true,
        class: "font-mono text-text-primary",
      },
      {
        variant: "mono",
        inverted: false,
        class: "font-mono text-text-primary",
      },
      // Accent + Inverted
      {
        variant: "accent",
        inverted: true,
        class: "text-[var(--color-primary-400)]",
      },
      {
        variant: "accent",
        inverted: false,
        class: "text-[var(--color-primary-500)]",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "md",
      weight: "normal",
      inverted: false,
    },
  }
);
