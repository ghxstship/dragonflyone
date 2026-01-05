import { cva } from "class-variance-authority";

/**
 * Link variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 */
export const linkVariants = cva(
  [
    // Base styles
    "transition-colors duration-[var(--duration-fast)] ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      variant: {
        default: [
          "text-[var(--color-text-primary)]",
          "hover:text-[var(--color-text-secondary)]",
        ],
        nav: [
          "font-heading",
          "text-[var(--font-size-label-sm)]",
          "uppercase",
          "tracking-widest",
          "leading-none",
          "hover:text-[var(--color-text-secondary)]",
        ],
        footer: [
          "font-body",
          "text-[var(--color-text-secondary)]",
          "hover:text-[var(--color-text-primary)]",
        ],
        inline: [
          "underline",
          "underline-offset-4",
          "hover:text-[var(--color-text-secondary)]",
        ],
        button: [
          "border-2",
          "border-[var(--color-border-default)]",
          "px-[var(--spacing-6)]",
          "py-[var(--spacing-3)]",
          "font-code",
          "text-[var(--font-size-label-sm)]",
          "uppercase",
          "tracking-widest",
          "leading-none",
          "transition-all duration-[var(--duration-fast)] ease-[var(--easing-bounce)]",
          "hover:-translate-y-0.5",
          "hover:bg-[var(--color-surface-elevated)]",
          "hover:text-[var(--color-text-primary)]",
        ],
      },
      size: {
        sm: ["text-[var(--font-size-body-sm)]"],
        md: ["text-[var(--font-size-body-sm)]"],
        lg: ["text-[var(--font-size-body-md)]"],
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export type LinkVariantProps = Parameters<typeof linkVariants>[0];
