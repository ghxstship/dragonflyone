import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const imageGalleryVariants = cva("grid gap-gap-md", {
  variants: {
    columns: {
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    },
  },
  defaultVariants: {
    columns: 3,
  },
});

export const imageVariants = cva("relative overflow-hidden bg-surface-elevated aspect-square border-2 border-black rounded-[var(--radius-card)] shadow-[4px_4px_0_rgba(0,0,0,0.1)] group cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(0,0,0,0.15)] transition-all duration-100 ease-[var(--ease-bounce)]", {
  variants: {},
  defaultVariants: {},
});

export type ImageGalleryVariants = VariantProps<typeof imageGalleryVariants>;
export type ImageVariants = VariantProps<typeof imageVariants>;
