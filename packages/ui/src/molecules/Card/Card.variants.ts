import { cva } from "class-variance-authority";

/**
 * Card variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 */
export const cardVariants = cva(
  [
    "p-4 sm:p-5 md:p-6",
    "rounded-[var(--radius-lg)]",
    "border-2",
    "transition-all duration-[var(--duration-fast)] ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-[var(--color-surface-card)]",
          "border-[var(--color-border-default)]",
          "text-[var(--color-text-primary)]",
          "shadow-[var(--shadow-card)]",
        ],
        outlined: [
          "bg-transparent",
          "border-[var(--color-border-default)]",
          "text-[var(--color-text-primary)]",
          "shadow-[var(--shadow-xs)]",
        ],
        elevated: [
          "bg-[var(--color-surface-card)]",
          "border-[var(--color-border-default)]",
          "text-[var(--color-text-primary)]",
          "shadow-[var(--shadow-lg)]",
        ],
        primary: [
          "bg-[var(--color-surface-card)]",
          "border-[var(--color-brand-primary)]",
          "text-[var(--color-text-primary)]",
          "shadow-[var(--shadow-card)]",
          "hover:shadow-[var(--shadow-lg)]",
          "hover:border-[var(--color-brand-primary-hover)]",
        ],
        accent: [
          "bg-[var(--color-surface-card)]",
          "border-[var(--color-brand-accent)]",
          "text-[var(--color-text-primary)]",
          "shadow-[var(--shadow-card)]",
          "hover:shadow-[var(--shadow-lg)]",
          "hover:brightness-105",
        ],
      },
      interactive: {
        true: [
          "cursor-pointer",
          "hover:-translate-x-0.5 hover:-translate-y-0.5",
          "active:translate-x-0.5 active:translate-y-0.5",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "focus:ring-[var(--color-brand-primary)]",
        ],
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
    },
  }
);

export type CardVariantProps = Parameters<typeof cardVariants>[0];
