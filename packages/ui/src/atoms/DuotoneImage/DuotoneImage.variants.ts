import { cva } from "class-variance-authority";

export const duotoneImageVariants = cva(
  // Base styles
  "relative overflow-hidden bg-muted",
  {
    variants: {
      aspectRatio: {
        '1:1': "aspect-square",
        '4:3': "aspect-[4/3]",
        '16:9': "aspect-video",
        '3:2': "aspect-[3/2]",
        '2:3': "aspect-[2/3]",
        '9:16': "aspect-[9/16]",
        '21:9': "aspect-[21/9]",
        'auto': "",
      },
      grayscale: {
        true: "grayscale",
        false: "",
      },
      highContrast: {
        true: "contrast-125 brightness-110",
        false: "",
      },
      halftoneHover: {
        true: "hover:opacity-90",
        false: "",
      },
      invertOnHover: {
        true: "hover:invert",
        false: "",
      },
      scaleOnHover: {
        true: "hover:scale-105",
        false: "",
      },
    },
    compoundVariants: [
      {
        grayscale: true,
        highContrast: true,
        class: "grayscale contrast-125 brightness-110",
      },
      {
        invertOnHover: true,
        scaleOnHover: true,
        class: "hover:invert hover:scale-105",
      },
    ],
    defaultVariants: {
      aspectRatio: "auto",
      grayscale: true,
      highContrast: false,
      halftoneHover: false,
      invertOnHover: false,
      scaleOnHover: false,
    },
  }
);

export const duotoneImageObjectFitVariants = cva(
  // Base styles
  "w-full h-full transition-all duration-300",
  {
    variants: {
      objectFit: {
        cover: "object-cover",
        contain: "object-contain",
        fill: "object-fill",
        none: "object-none",
        'scale-down': "object-scale-down",
      },
    },
    defaultVariants: {
      objectFit: "cover",
    },
  }
);
