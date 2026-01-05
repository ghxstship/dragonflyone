import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const videoPlayerVariants = cva("relative overflow-hidden rounded-card bg-surface-elevated", {
  variants: {
    aspectRatio: {
      "16:9": "aspect-video",
      "4:3": "aspect-[4/3]",
      "1:1": "aspect-square",
      "9:16": "aspect-[9/16]",
      "21:9": "aspect-[21/9]",
    },
    grayscale: {
      true: "grayscale",
      false: "",
    },
    controls: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    aspectRatio: "16:9",
    grayscale: false,
    controls: true,
  },
});

export type VideoPlayerVariants = VariantProps<typeof videoPlayerVariants>;
