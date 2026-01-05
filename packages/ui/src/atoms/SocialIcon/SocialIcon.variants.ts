import { cva } from "class-variance-authority";

export const socialIconVariants = cva(
  // Base styles
  "inline-flex items-center justify-center border-2 rounded-[var(--radius-button)] transition-all duration-100 ease-[var(--ease-bounce)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0",
  {
    variants: {
      size: {
        sm: "w-spacing-8 h-spacing-8",
        md: "w-spacing-10 h-spacing-10",
        lg: "w-spacing-12 h-spacing-12",
      },
      inverted: {
        true: "border-white text-white shadow-[2px_2px_0_rgba(255,255,255,0.2)] hover:bg-white hover:text-black hover:shadow-[3px_3px_0_rgba(255,255,255,0.25)]",
        false: "border-black text-black shadow-[2px_2px_0_rgba(0,0,0,0.15)] hover:bg-black hover:text-white hover:shadow-[3px_3px_0_rgba(0,0,0,0.2)]",
      },
    },
    defaultVariants: {
      size: "md",
      inverted: false,
    },
  }
);
