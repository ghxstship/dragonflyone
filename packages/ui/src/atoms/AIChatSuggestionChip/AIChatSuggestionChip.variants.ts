import { cva } from "class-variance-authority";

export const aiChatSuggestionChipVariants = cva(
  "inline-flex items-center px-3 py-2 text-sm font-mono border-2 border-[var(--color-border-default)] rounded-badge bg-[var(--color-surface-primary)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-primary-500)] hover:text-[var(--color-primary-500)] hover:shadow-[var(--shadow-primary)] transition-all duration-200 cursor-pointer",
  {
    variants: {
      disabled: {
        true: "opacity-50 cursor-not-allowed hover:bg-[var(--color-surface-primary)] hover:border-[var(--color-border-default)] hover:text-[var(--color-text-primary)] hover:shadow-none",
      },
    },
    defaultVariants: {
      disabled: false,
    },
  }
);
