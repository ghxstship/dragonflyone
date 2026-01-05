import { cva } from "class-variance-authority";

/**
 * Icon variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 */
export const iconVariants = cva(
  [
    // Base styles
    "inline-block",
  ],
  {
    variants: {
      size: {
        xs: ["w-[var(--spacing-3)] h-[var(--spacing-3)]"],
        sm: ["w-[var(--spacing-4)] h-[var(--spacing-4)]"],
        md: ["w-[var(--spacing-5)] h-[var(--spacing-5)]"],
        lg: ["w-[var(--spacing-6)] h-[var(--spacing-6)]"],
        xl: ["w-[var(--spacing-8)] h-[var(--spacing-8)]"],
      },
      strokeWidth: {
        thin: ["stroke-[1px]"],
        regular: ["stroke-[2px]"],
        bold: ["stroke-[3px]"],
      },
    },
    defaultVariants: {
      size: "md",
      strokeWidth: "regular",
    },
  }
);

export type IconVariantProps = Parameters<typeof iconVariants>[0];
