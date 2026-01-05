import { cva } from "class-variance-authority";

/**
 * Button variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system:
 * - --radius-md, --radius-lg for border radius
 * - --shadow-sm, --shadow-md, --shadow-lg for shadows
 * - --duration-fast for transitions
 * - --easing-easeOut for animation curves
 */
export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium leading-none",
    "border-2",
    "rounded-[var(--radius-md)]",
    "transition-all duration-[var(--duration-fast)] ease-[var(--easing-easeOut)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "focus-visible:ring-[var(--color-brand-primary)]",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
  ],
  {
    variants: {
      variant: {
        solid: [
          "bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]",
          "border-[var(--color-border-default)]",
          "shadow-[var(--shadow-sm)]",
          "hover:bg-[var(--color-surface-overlay)] hover:shadow-[var(--shadow-md)]",
          "active:shadow-[var(--shadow-xs)]",
        ],
        outline: [
          "bg-transparent text-[var(--color-text-primary)]",
          "border-[var(--color-border-default)]",
          "shadow-[var(--shadow-xs)]",
          "hover:bg-[var(--color-surface-elevated)] hover:shadow-[var(--shadow-sm)]",
          "active:shadow-none",
        ],
        ghost: [
          "bg-transparent text-[var(--color-text-primary)]",
          "border-transparent",
          "shadow-none",
          "hover:bg-[var(--color-surface-elevated)]",
          "active:bg-[var(--color-surface-overlay)]",
        ],
        primary: [
          "bg-[var(--color-brand-primary)] text-white",
          "border-[var(--color-brand-primary)]",
          "shadow-[var(--shadow-sm)]",
          "hover:bg-[var(--color-brand-primary-hover)] hover:border-[var(--color-brand-primary-hover)] hover:shadow-[var(--shadow-md)]",
          "active:bg-[var(--color-brand-primary-active)] active:shadow-[var(--shadow-xs)]",
          "focus-visible:ring-[var(--color-brand-primary)]",
        ],
        accent: [
          "bg-[var(--color-brand-accent)] text-white",
          "border-[var(--color-brand-accent)]",
          "shadow-[var(--shadow-sm)]",
          "hover:brightness-110 hover:shadow-[var(--shadow-md)]",
          "active:brightness-90 active:shadow-[var(--shadow-xs)]",
          "focus-visible:ring-[var(--color-brand-accent)]",
        ],
        destructive: [
          "bg-[var(--color-error)] text-white",
          "border-[var(--color-error)]",
          "shadow-[var(--shadow-sm)]",
          "hover:brightness-110 hover:shadow-[var(--shadow-md)]",
          "active:brightness-90 active:shadow-[var(--shadow-xs)]",
          "focus-visible:ring-[var(--color-error)]",
        ],
      },
      size: {
        sm: "px-3 py-1.5 text-xs min-h-[32px]",
        md: "px-4 py-2 text-sm min-h-[40px]",
        lg: "px-6 py-3 text-base min-h-[48px]",
        xl: "px-8 py-4 text-lg min-h-[56px]",
        icon: "p-2 min-h-[40px] min-w-[40px]",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
      fullWidth: false,
    },
  }
);

export type ButtonVariantProps = Parameters<typeof buttonVariants>[0];
