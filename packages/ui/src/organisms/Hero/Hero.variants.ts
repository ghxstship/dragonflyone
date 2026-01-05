import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const heroVariants = cva("relative overflow-hidden", {
  variants: {
    fullHeight: {
      true: "min-h-screen",
      false: "min-h-[600px]",
    },
    background: {
      black: "bg-black text-white",
      white: "bg-white text-black",
    },
    pattern: {
      halftone: "",
      grid: "",
      stripes: "",
      benday: "",
      none: "",
    },
  },
  defaultVariants: {
    fullHeight: true,
    background: "black",
    pattern: "none",
  },
});

export type HeroVariants = VariantProps<typeof heroVariants>;
