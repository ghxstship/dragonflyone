import { cva } from "class-variance-authority";

export const pageTransitionVariants = cva(
  // Base styles
  "transition-all",
  {
    variants: {
      type: {
        fade: {
          initial: "opacity-0",
          animate: "opacity-100",
        },
        "slide-up": {
          initial: "opacity-0 translate-y-8",
          animate: "opacity-100 translate-y-0",
        },
        "slide-down": {
          initial: "opacity-0 -translate-y-8",
          animate: "opacity-100 translate-y-0",
        },
        "slide-left": {
          initial: "opacity-0 translate-x-8",
          animate: "opacity-100 translate-x-0",
        },
        "slide-right": {
          initial: "opacity-0 -translate-x-8",
          animate: "opacity-100 translate-x-0",
        },
        zoom: {
          initial: "opacity-0 scale-95",
          animate: "opacity-100 scale-100",
        },
        wipe: {
          initial: "clip-path-[inset(0_100%_0_0)]",
          animate: "clip-path-[inset(0_0_0_0)]",
        },
      },
      state: {
        initial: "",
        animate: "",
      },
    },
    compoundVariants: [
      // Fade combinations
      {
        type: "fade",
        state: "initial",
        class: "opacity-0",
      },
      {
        type: "fade",
        state: "animate",
        class: "opacity-100",
      },
      // Slide-up combinations
      {
        type: "slide-up",
        state: "initial",
        class: "opacity-0 translate-y-8",
      },
      {
        type: "slide-up",
        state: "animate",
        class: "opacity-100 translate-y-0",
      },
      // Slide-down combinations
      {
        type: "slide-down",
        state: "initial",
        class: "opacity-0 -translate-y-8",
      },
      {
        type: "slide-down",
        state: "animate",
        class: "opacity-100 translate-y-0",
      },
      // Slide-left combinations
      {
        type: "slide-left",
        state: "initial",
        class: "opacity-0 translate-x-8",
      },
      {
        type: "slide-left",
        state: "animate",
        class: "opacity-100 translate-x-0",
      },
      // Slide-right combinations
      {
        type: "slide-right",
        state: "initial",
        class: "opacity-0 -translate-x-8",
      },
      {
        type: "slide-right",
        state: "animate",
        class: "opacity-100 translate-x-0",
      },
      // Zoom combinations
      {
        type: "zoom",
        state: "initial",
        class: "opacity-0 scale-95",
      },
      {
        type: "zoom",
        state: "animate",
        class: "opacity-100 scale-100",
      },
      // Wipe combinations
      {
        type: "wipe",
        state: "initial",
        class: "clip-path-[inset(0_100%_0_0)]",
      },
      {
        type: "wipe",
        state: "animate",
        class: "clip-path-[inset(0_0_0_0)]",
      },
    ],
    defaultVariants: {
      type: "fade",
      state: "animate",
    },
  }
);
