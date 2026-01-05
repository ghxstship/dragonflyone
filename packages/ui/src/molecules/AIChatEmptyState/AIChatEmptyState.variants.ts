import { cva } from "class-variance-authority";

/**
 * AIChatEmptyState variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Centered layout with icon/illustration
 * - Clear visual hierarchy
 * - Suggestion prompts
 */
export const aiChatEmptyStateVariants = cva(
  [
    // Base styles
    "flex",
    "h-full",
    "flex-col",
    "items-center",
    "justify-center",
    "p-8",
    "text-center",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * AIChatEmptyState container variants using CVA (Class Variance Authority)
 */
export const aiChatEmptyStateContainerVariants = cva(
  [
    // Base styles
    "flex",
    "max-w-md",
    "flex-col",
    "items-center",
    "gap-6",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * AIChatEmptyState icon variants using CVA (Class Variance Authority)
 */
export const aiChatEmptyStateIconVariants = cva(
  [
    // Base styles
    "flex",
    "w-16",
    "h-16",
    "items-center",
    "justify-center",
    "border-2",
    "rounded-[var(--radius-card)]",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-surface-elevated-inverse border-border-inverse text-text-inverse",
        false: "bg-surface-elevated border-border text-text-primary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * AIChatEmptyState title variants using CVA (Class Variance Authority)
 */
export const aiChatEmptyStateTitleVariants = cva(
  [
    // Base styles
    "text-xl",
    "font-bold",
    "mb-2",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "text-text-inverse",
        false: "text-text-primary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * AIChatEmptyState description variants using CVA (Class Variance Authority)
 */
export const aiChatEmptyStateDescriptionVariants = cva(
  [
    // Base styles
    "mb-6",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "text-text-secondary-inverse",
        false: "text-text-secondary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * AIChatEmptyState suggestions variants using CVA (Class Variance Authority)
 */
export const aiChatEmptyStateSuggestionsVariants = cva(
  [
    // Base styles
    "flex",
    "flex-col",
    "gap-2",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);
