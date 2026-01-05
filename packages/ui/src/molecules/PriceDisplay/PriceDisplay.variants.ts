import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const priceDisplayVariants = cva("flex flex-col gap-gap-xs", {
  variants: {
    size: {
      sm: "price-sm",
      md: "price-md", 
      lg: "price-lg",
      xl: "price-xl",
    },
    inverted: {
      true: "inverted",
      false: "",
    },
  },
  defaultVariants: {
    size: "md",
    inverted: false,
  },
});

export const priceRangeVariants = cva("flex items-baseline gap-gap-xs", {
  variants: {
    size: {
      sm: "range-sm",
      md: "range-md",
      lg: "range-lg",
    },
    inverted: {
      true: "inverted",
      false: "",
    },
  },
  defaultVariants: {
    size: "md",
    inverted: false,
  },
});

export type PriceDisplayVariants = VariantProps<typeof priceDisplayVariants>;
export type PriceRangeVariants = VariantProps<typeof priceRangeVariants>;
