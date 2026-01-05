import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const lightboxVariants = cva("", {
  variants: {
    animation: {
      fade: "transition-opacity",
      slide: "transition-transform",
      zoom: "transition-transform",
    },
    grayscale: {
      true: "grayscale",
      false: "",
    },
    showThumbnails: {
      true: "",
      false: "",
    },
    showNavigation: {
      true: "",
      false: "",
    },
    showCounter: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    animation: "fade",
    grayscale: false,
    showThumbnails: false,
    showNavigation: true,
    showCounter: true,
  },
});

export type LightboxVariants = VariantProps<typeof lightboxVariants>;
