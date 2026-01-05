import { cva } from "class-variance-authority";

/**
 * Avatar variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 */
export const avatarVariants = cva(
  [
    // Base styles
    "relative",
    "inline-flex",
    "items-center",
    "justify-center",
    "overflow-hidden",
    "shrink-0",
    "transition-all duration-[var(--duration-fast)] ease-[var(--easing-bounce)]",
    "bg-[var(--color-surface-elevated)]",
  ],
  {
    variants: {
      size: {
        xs: [
          "w-6 h-6 sm:w-[var(--size-avatar-xs)] sm:h-[var(--size-avatar-xs)]",
        ],
        sm: [
          "w-7 h-7 sm:w-[var(--size-avatar-sm)] sm:h-[var(--size-avatar-sm)]",
        ],
        md: [
          "w-8 h-8 sm:w-[var(--size-avatar-md)] sm:h-[var(--size-avatar-md)]",
        ],
        lg: [
          "w-10 h-10 sm:w-[var(--size-avatar-lg)] sm:h-[var(--size-avatar-lg)]",
        ],
        xl: [
          "w-12 h-12 sm:w-[var(--size-avatar-xl)] sm:h-[var(--size-avatar-xl)]",
        ],
      },
      shape: {
        circle: ["rounded-[var(--radius-circle)]"],
        square: ["rounded-[var(--radius-badge)]"],
      },
      bordered: {
        true: [
          "border-2",
          "border-[var(--color-border-default)]",
          "shadow-[var(--shadow-xs)]",
        ],
        false: [],
      },
      interactive: {
        true: [
          "cursor-pointer",
          "hover:-translate-x-0.5 hover:-translate-y-0.5",
          "bordered: hover:shadow-[var(--shadow-sm)]",
          "active:translate-x-0 active:translate-y-0",
          "bordered: active:shadow-none",
        ],
        false: [],
      },
    },
    defaultVariants: {
      size: "md",
      shape: "circle",
      bordered: false,
      interactive: false,
    },
  }
);

export type AvatarVariantProps = Parameters<typeof avatarVariants>[0];

// Status indicator variants
export const avatarStatusVariants = cva(
  [
    "absolute",
    "rounded-[var(--radius-circle)]",
    "border-2",
    "border-[var(--color-surface-primary)]",
  ],
  {
    variants: {
      status: {
        online: ["bg-[var(--color-success-500)]"],
        offline: ["bg-[var(--color-text-muted)]"],
        away: ["bg-[var(--color-warning-500)]"],
        busy: ["bg-[var(--color-error-500)]"],
      },
      size: {
        xs: ["w-1 h-1 sm:w-[var(--spacing-1)] sm:h-[var(--spacing-1)]"],
        sm: ["w-1.5 h-1.5 sm:w-[var(--spacing-2)] sm:h-[var(--spacing-2)]"],
        md: ["w-2 h-2 sm:w-[var(--spacing-2)] sm:h-[var(--spacing-2)]"],
        lg: ["w-2.5 h-2.5 sm:w-[var(--spacing-3)] sm:h-[var(--spacing-3)]"],
        xl: ["w-3 h-3 sm:w-[var(--spacing-4)] sm:h-[var(--spacing-4)]"],
      },
      shape: {
        circle: ["bottom-0 right-0"],
        square: ["-bottom-0.5 -right-0.5"],
      },
    },
  }
);

export type AvatarStatusVariantProps = Parameters<typeof avatarStatusVariants>[0];
