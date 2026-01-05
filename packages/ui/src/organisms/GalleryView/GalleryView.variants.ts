import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const galleryViewVariants = cva("", {
  variants: {
    layout: {
      grid: "",
      masonry: "",
      list: "",
    },
    size: {
      small: "",
      medium: "",
      large: "",
    },
    inverted: {
      true: "",
      false: "",
    },
    loading: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    layout: "grid",
    size: "medium",
    inverted: true,
    loading: false,
  },
});

export type GalleryViewVariants = VariantProps<typeof galleryViewVariants>;
