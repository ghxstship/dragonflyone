import { cva } from "class-variance-authority";

export const aiChatSuggestionChipVariants = cva(
  "inline-flex items-center px-3 py-2 text-sm font-mono border-2 border-border rounded-badge bg-surface-primary text-text-primary hover:bg-surface-elevated hover:border-primary hover:text-primary hover:shadow-primary transition-all duration-200 cursor-pointer",
  {
    variants: {
      disabled: {
        true: "opacity-50 cursor-not-allowed hover:bg-surface-primary hover:border-border hover:text-text-primary hover:shadow-none",
      },
    },
    defaultVariants: {
      disabled: false,
    },
  }
);
