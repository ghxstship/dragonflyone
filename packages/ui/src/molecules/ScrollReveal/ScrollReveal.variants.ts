import { cva } from "class-variance-authority";

/**
 * ScrollReveal variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Scroll reveal animations with intersection observer
 */
export const scrollRevealVariants = cva(
  [
    // Base styles
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Animation type
       */
      animation: {
        fade: "",
        "slide-up": "",
        "slide-down": "",
        "slide-left": "",
        "slide-right": "",
        scale: "",
        rotate: "",
      },
      
      /**
       * Animation state
       */
      state: {
        initial: "",
        animate: "",
        disabled: "",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      animation: "fade",
      state: "initial",
      inverted: false,
    },
    
    compoundVariants: [
      // Fade animation states
      {
        animation: "fade",
        state: "initial",
        inverted: true,
        class: "opacity-0",
      },
      {
        animation: "fade",
        state: "initial",
        inverted: false,
        class: "opacity-0",
      },
      {
        animation: "fade",
        state: "animate",
        inverted: true,
        class: "opacity-100",
      },
      {
        animation: "fade",
        state: "animate",
        inverted: false,
        class: "opacity-100",
      },
      
      // Slide up animation states
      {
        animation: "slide-up",
        state: "initial",
        inverted: true,
        class: "opacity-0 translate-y-[var(--scroll-reveal-distance)]",
      },
      {
        animation: "slide-up",
        state: "initial",
        inverted: false,
        class: "opacity-0 translate-y-[var(--scroll-reveal-distance)]",
      },
      {
        animation: "slide-up",
        state: "animate",
        inverted: true,
        class: "opacity-100 translate-y-0",
      },
      {
        animation: "slide-up",
        state: "animate",
        inverted: false,
        class: "opacity-100 translate-y-0",
      },
      
      // Slide down animation states
      {
        animation: "slide-down",
        state: "initial",
        inverted: true,
        class: "opacity-0 -translate-y-[var(--scroll-reveal-distance)]",
      },
      {
        animation: "slide-down",
        state: "initial",
        inverted: false,
        class: "opacity-0 -translate-y-[var(--scroll-reveal-distance)]",
      },
      {
        animation: "slide-down",
        state: "animate",
        inverted: true,
        class: "opacity-100 translate-y-0",
      },
      {
        animation: "slide-down",
        state: "animate",
        inverted: false,
        class: "opacity-100 translate-y-0",
      },
      
      // Slide left animation states
      {
        animation: "slide-left",
        state: "initial",
        inverted: true,
        class: "opacity-0 translate-x-[var(--scroll-reveal-distance)]",
      },
      {
        animation: "slide-left",
        state: "initial",
        inverted: false,
        class: "opacity-0 translate-x-[var(--scroll-reveal-distance)]",
      },
      {
        animation: "slide-left",
        state: "animate",
        inverted: true,
        class: "opacity-100 translate-x-0",
      },
      {
        animation: "slide-left",
        state: "animate",
        inverted: false,
        class: "opacity-100 translate-x-0",
      },
      
      // Slide right animation states
      {
        animation: "slide-right",
        state: "initial",
        inverted: true,
        class: "opacity-0 -translate-x-[var(--scroll-reveal-distance)]",
      },
      {
        animation: "slide-right",
        state: "initial",
        inverted: false,
        class: "opacity-0 -translate-x-[var(--scroll-reveal-distance)]",
      },
      {
        animation: "slide-right",
        state: "animate",
        inverted: true,
        class: "opacity-100 translate-x-0",
      },
      {
        animation: "slide-right",
        state: "animate",
        inverted: false,
        class: "opacity-100 translate-x-0",
      },
      
      // Scale animation states
      {
        animation: "scale",
        state: "initial",
        inverted: true,
        class: "opacity-0 scale-75",
      },
      {
        animation: "scale",
        state: "initial",
        inverted: false,
        class: "opacity-0 scale-75",
      },
      {
        animation: "scale",
        state: "animate",
        inverted: true,
        class: "opacity-100 scale-100",
      },
      {
        animation: "scale",
        state: "animate",
        inverted: false,
        class: "opacity-100 scale-100",
      },
      
      // Rotate animation states
      {
        animation: "rotate",
        state: "initial",
        inverted: true,
        class: "opacity-0 rotate-12",
      },
      {
        animation: "rotate",
        state: "initial",
        inverted: false,
        class: "opacity-0 rotate-12",
      },
      {
        animation: "rotate",
        state: "animate",
        inverted: true,
        class: "opacity-100 rotate-0",
      },
      {
        animation: "rotate",
        state: "animate",
        inverted: false,
        class: "opacity-100 rotate-0",
      },
      
      // Disabled state
      {
        state: "disabled",
        inverted: true,
        class: "opacity-100 translate-x-0 translate-y-0 scale-100 rotate-0",
      },
      {
        state: "disabled",
        inverted: false,
        class: "opacity-100 translate-x-0 translate-y-0 scale-100 rotate-0",
      },
    ],
  }
);
