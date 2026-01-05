import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const navigationVariants = cva("w-full border-b-2 transition-colors", {
  variants: {
    fixed: {
      true: "fixed top-0 left-0 right-0 z-fixed",
      false: "",
    },
    inverted: {
      true: "bg-black border-border",
      false: "bg-white border-black",
    },
  },
  defaultVariants: {
    fixed: false,
    inverted: false,
  },
});

export const navLinkVariants = cva("font-heading text-sm uppercase tracking-wider font-bold leading-none transition-all duration-100 ease-[var(--ease-bounce)] hover:-translate-y-0.5", {
  variants: {
    active: {
      true: "border-b-2",
      false: "",
    },
    inverted: {
      true: "text-white hover:text-text-secondary",
      false: "text-black hover:text-text-disabled",
    },
  },
  defaultVariants: {
    active: false,
    inverted: false,
  },
});

export type NavigationVariants = VariantProps<typeof navigationVariants>;
export type NavLinkVariants = VariantProps<typeof navLinkVariants>;
