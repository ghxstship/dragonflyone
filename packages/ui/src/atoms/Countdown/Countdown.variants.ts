import { cva } from "class-variance-authority";

export const countdownVariants = cva(
  // Base styles
  "flex items-start justify-center",
  {
    variants: {
      variant: {
        default: "gap-2 sm:gap-gap-md",
        compact: "gap-1 sm:gap-gap-xs",
        large: "gap-3 sm:gap-gap-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const timeUnitVariants = cva(
  // Base styles
  "font-heading font-weight-normal border-2 text-center tracking-wide uppercase rounded-[var(--radius-badge)] bg-[var(--color-surface-primary)] text-[var(--color-text-primary)] border-[var(--color-border-default)] shadow-[3px_3px_0_var(--color-shadow-default)]",
  {
    variants: {
      variant: {
        default: "text-lg sm:text-h2-md px-3 py-2 sm:px-spacing-5 sm:py-spacing-4 min-w-[2.5rem] sm:min-w-spacing-14",
        compact: "text-base sm:text-h4-md px-2 py-1 sm:px-spacing-3 sm:py-spacing-2 min-w-[2rem] sm:min-w-spacing-10",
        large: "text-2xl sm:text-h1-md px-4 py-3 sm:px-spacing-8 sm:py-spacing-6 min-w-[3rem] sm:min-w-spacing-20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const timeLabelVariants = cva(
  // Base styles
  "font-code uppercase tracking-widest text-[var(--color-text-secondary)]",
  {
    variants: {
      variant: {
        default: "text-[10px] sm:text-mono-sm",
        compact: "text-[9px] sm:text-mono-xs",
        large: "text-xs sm:text-mono-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const separatorVariants = cva(
  // Base styles
  "font-heading text-[var(--color-text-primary)]",
  {
    variants: {
      variant: {
        default: "text-h2-md",
        compact: "text-h4-md",
        large: "text-h1-md",
      },
      showLabels: {
        true: "self-start pt-spacing-4",
        false: "self-center",
      },
    },
    defaultVariants: {
      variant: "default",
      showLabels: true,
    },
  }
);

export const expiredVariants = cva(
  // Base styles
  "font-heading uppercase tracking-wide text-center text-[var(--color-text-primary)]",
  {
    variants: {
      variant: {
        default: "text-h2-md",
        compact: "text-h4-md",
        large: "text-h1-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
