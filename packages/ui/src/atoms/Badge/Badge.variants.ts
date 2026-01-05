import { cva } from "class-variance-authority";

/**
 * Badge variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 */
export const badgeVariants = cva(
  [
    // Base styles
    "inline-flex",
    "items-center",
    "font-code",
    "uppercase",
    "tracking-widest",
    "leading-none",
    "font-bold",
    "rounded-[var(--radius-badge)]",
    "border-2",
  ],
  {
    variants: {
      variant: {
        solid: [
          "bg-[var(--color-surface-primary)]",
          "text-[var(--color-text-primary)]",
          "border-[var(--color-surface-primary)]",
        ],
        outline: [
          "bg-transparent",
          "text-[var(--color-text-primary)]",
          "border-[var(--color-border-default)]",
        ],
        ghost: [
          "bg-[var(--color-surface-elevated)]",
          "text-[var(--color-text-primary)]",
          "border-transparent",
        ],
        success: [
          "bg-[var(--color-success-500)]",
          "text-[var(--color-text-primary)]",
          "border-[var(--color-success-500)]",
        ],
        warning: [
          "bg-[var(--color-warning-500)]",
          "text-[var(--color-text-primary)]",
          "border-[var(--color-warning-500)]",
        ],
        error: [
          "bg-[var(--color-error-500)]",
          "text-[var(--color-text-primary)]",
          "border-[var(--color-error-500)]",
        ],
        info: [
          "bg-[var(--color-info-500)]",
          "text-[var(--color-text-primary)]",
          "border-[var(--color-info-500)]",
        ],
        pop: [
          "bg-[var(--color-surface-inverse)]",
          "text-[var(--color-text-primary)]",
          "border-[var(--color-brand-accent)]",
          "shadow-[var(--shadow-sm)]",
        ],
        destructive: [
          "bg-[var(--color-error-500)]",
          "text-[var(--color-text-primary)]",
          "border-[var(--color-error-500)]",
        ],
        secondary: [
          "bg-[var(--color-surface-secondary)]",
          "text-[var(--color-text-secondary)]",
          "border-[var(--color-border-default)]",
        ],
      },
      size: {
        sm: [
          "px-1.5 py-0.5 text-[8px]",
          "sm:px-2 sm:text-[10px]",
        ],
        md: [
          "px-2 py-0.5 text-[10px]",
          "sm:px-3 sm:py-1 sm:text-xs",
        ],
        lg: [
          "px-3 py-1 text-xs",
          "sm:px-4 sm:py-1.5 sm:text-sm",
        ],
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  }
);

export type BadgeVariantProps = Parameters<typeof badgeVariants>[0];
