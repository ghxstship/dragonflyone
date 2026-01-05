import { cva } from "class-variance-authority";
import type { AlertVariant } from "./Alert.types.js";

/**
 * Alert variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Panel style with bold borders
 * - Hard offset shadow
 * - Icon emphasis
 * - Uppercase title
 */
export const alertVariants = cva(
  [
    // Base styles
    "border-2",
    "rounded-[var(--radius-card)]",
    "shadow-md",
    "p-4",
    "transition-all duration-[var(--duration-fast)] ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Alert variant
       */
      variant: {
        info: {
          inverted: "bg-info-900 border-info-400 text-info-100",
          normal: "bg-info-50 border-info-500 text-info-900",
        },
        success: {
          inverted: "bg-success-900 border-success-400 text-success-100",
          normal: "bg-success-50 border-success-500 text-success-900",
        },
        warning: {
          inverted: "bg-warning-900 border-warning-400 text-warning-100",
          normal: "bg-warning-50 border-warning-500 text-warning-900",
        },
        error: {
          inverted: "bg-error-900 border-error-400 text-error-100",
          normal: "bg-error-50 border-error-500 text-error-900",
        },
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
      variant: "info",
      inverted: true,
    },
    
    compoundVariants: [
      {
        variant: "info",
        inverted: true,
        class: "bg-info-900 border-info-400 text-info-100",
      },
      {
        variant: "info",
        inverted: false,
        class: "bg-info-50 border-info-500 text-info-900",
      },
      {
        variant: "success",
        inverted: true,
        class: "bg-success-900 border-success-400 text-success-100",
      },
      {
        variant: "success",
        inverted: false,
        class: "bg-success-50 border-success-500 text-success-900",
      },
      {
        variant: "warning",
        inverted: true,
        class: "bg-warning-900 border-warning-400 text-warning-100",
      },
      {
        variant: "warning",
        inverted: false,
        class: "bg-warning-50 border-warning-500 text-warning-900",
      },
      {
        variant: "error",
        inverted: true,
        class: "bg-error-900 border-error-400 text-error-100",
      },
      {
        variant: "error",
        inverted: false,
        class: "bg-error-50 border-error-500 text-error-900",
      },
    ],
  }
);
