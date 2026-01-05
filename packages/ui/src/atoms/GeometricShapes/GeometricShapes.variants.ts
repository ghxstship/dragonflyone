import { cva } from "class-variance-authority";

export const geometricShapeVariants = cva(
  // Base styles
  "",
  {
    variants: {
      shape: {
        square: "",
        circle: "rounded-full",
        triangle: "",
        diamond: "",
        hexagon: "",
        cross: "",
        arrow: "",
      },
      fill: {
        black: "bg-black",
        white: "bg-white",
        transparent: "bg-transparent",
        grey: "bg-muted",
      },
      stroke: {
        true: "border-black",
        false: "",
      },
      animate: {
        spin: "animate-spin",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
        none: "",
      },
    },
    compoundVariants: [
      {
        stroke: true,
        fill: "black",
        class: "border-black",
      },
      {
        stroke: true,
        fill: "white",
        class: "border-white",
      },
      {
        stroke: true,
        fill: "grey",
        class: "border-border",
      },
    ],
    defaultVariants: {
      shape: "square",
      fill: "black",
      stroke: false,
      animate: "none",
    },
  }
);

export const geometricPatternVariants = cva(
  // Base styles
  "relative",
  {
    variants: {
      pattern: {
        dots: "",
        grid: "",
        diagonal: "",
        chevron: "",
        zigzag: "",
      },
      color: {
        black: "",
        white: "",
        grey: "",
      },
      size: {
        sm: "",
        md: "",
        lg: "",
      },
    },
    defaultVariants: {
      pattern: "dots",
      color: "black",
      size: "md",
    },
  }
);
