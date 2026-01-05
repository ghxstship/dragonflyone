import { cva, type VariantProps } from "class-variance-authority";
import cn from "clsx";

export const addressInputVariants = cva(
  // Base styles
  "font-body px-3 py-2 h-10 sm:px-4 sm:py-3 sm:h-11 w-full text-sm sm:text-base border-2 rounded-[var(--radius-input)] transition-all duration-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      // Size variants
      size: {
        sm: "h-9 px-2 py-1.5 text-sm",
        md: "h-10 px-3 py-2 text-sm sm:text-base",
        lg: "h-11 px-4 py-3 text-base",
      },
      
      // Theme variants
      inverted: {
        true: "placeholder:text-text-disabled border-border bg-surface-inverse text-text-primary shadow-[2px_2px_0_rgba(255,255,255,0.1)] hover:border-border-primary focus:border-[var(--color-primary-400)] focus:-translate-x-px focus:-translate-y-px focus:shadow-[3px_3px_0_var(--color-primary-200)]",
        false: "placeholder:text-text-muted border-border bg-surface-primary text-text-primary shadow-[2px_2px_0_rgba(0,0,0,0.08)] hover:border-border-primary focus:border-[var(--color-primary-500)] focus:-translate-x-px focus:-translate-y-px focus:shadow-[3px_3px_0_var(--color-primary-200)]",
      },
      
      // Error state
      error: {
        true: "border-error-500",
      },
      
      // Error state with inverted theme
      errorInverted: {
        true: "bg-surface-inverse text-text-primary shadow-[2px_2px_0_rgba(239,68,68,0.3)]",
        false: "bg-white text-black shadow-[2px_2px_0_rgba(239,68,68,0.2)]",
      },
      
      // Full width
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
    },
    defaultVariants: {
      size: "md",
      inverted: false,
      error: false,
      errorInverted: false,
      fullWidth: false,
    },
  }
);
