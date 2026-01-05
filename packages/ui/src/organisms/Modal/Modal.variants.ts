import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const modalVariants = cva("relative w-full border-4 rounded-[var(--radius-modal)] animate-pop-in", {
  variants: {
    size: {
      sm: "max-w-md",
      md: "max-w-lg",
      lg: "max-w-2xl",
      xl: "max-w-4xl",
    },
    inverted: {
      true: "bg-surface-inverse border-white text-text-primary shadow-[8px_8px_0_rgba(255,255,255,0.25)]",
      false: "bg-white border-black text-black shadow-[8px_8px_0_rgba(0,0,0,0.2)]",
    },
  },
  defaultVariants: {
    size: "md",
    inverted: true,
  },
});

export type ModalVariants = VariantProps<typeof modalVariants>;
