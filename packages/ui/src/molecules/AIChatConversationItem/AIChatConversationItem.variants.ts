import { cva } from "class-variance-authority";

/**
 * AIChatConversationGroup variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Clear visual hierarchy
 * - Grouped conversations
 */
export const aiChatConversationGroupVariants = cva(
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

/**
 * AIChatConversationGroup label variants using CVA (Class Variance Authority)
 */
export const aiChatConversationGroupLabelVariants = cva(
  [
    // Base styles
    "text-xs",
    "font-bold",
    "uppercase",
    "tracking-wider",
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
        true: "text-text-muted-inverse",
        false: "text-text-muted",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * AIChatConversationItem variants using CVA (Class Variance Authority)
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Clear visual hierarchy
 * - Interactive hover states
 * - Active/selected states
 */
export const aiChatConversationItemVariants = cva(
  [
    // Base styles
    "w-full",
    "flex",
    "items-start",
    "gap-3",
    "px-3",
    "py-2",
    "border-2",
    "rounded-button",
    "text-left",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "cursor-pointer",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
    "focus:ring-[var(--color-brand-primary)]",
    "group",
  ],
  {
    variants: {
      /**
       * Active state
       */
      isActive: {
        true: "",
        false: "",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      isActive: false,
      inverted: false,
    },
    
    compoundVariants: [
      // Active state combinations
      {
        isActive: true,
        inverted: true,
        class: "bg-surface-elevated-inverse border-brand-primary text-text-inverse",
      },
      {
        isActive: true,
        inverted: false,
        class: "bg-surface-elevated border-brand-primary text-text-primary",
      },
      
      // Inactive state combinations
      {
        isActive: false,
        inverted: true,
        class: "bg-transparent border-transparent text-text-secondary-inverse hover:bg-surface-hover-inverse hover:border-border-inverse",
      },
      {
        isActive: false,
        inverted: false,
        class: "bg-transparent border-transparent text-text-secondary hover:bg-surface-hover hover:border-border",
      },
    ],
  }
);

/**
 * AIChatConversationItem content variants using CVA (Class Variance Authority)
 */
export const aiChatConversationItemContentVariants = cva(
  [
    // Base styles
    "flex-1",
    "min-w-0",
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
 * AIChatConversationItem title variants using CVA (Class Variance Authority)
 */
export const aiChatConversationItemTitleVariants = cva(
  [
    // Base styles
    "font-medium",
    "text-sm",
    "truncate",
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
 * AIChatConversationItem preview variants using CVA (Class Variance Authority)
 */
export const aiChatConversationItemPreviewVariants = cva(
  [
    // Base styles
    "text-xs",
    "truncate",
    "opacity-75",
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
        true: "text-text-muted-inverse",
        false: "text-text-muted",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * AIChatConversationItem timestamp variants using CVA (Class Variance Authority)
 */
export const aiChatConversationItemTimestampVariants = cva(
  [
    // Base styles
    "text-xs",
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
        true: "text-text-muted-inverse",
        false: "text-text-muted",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * AIChatConversationItem actions variants using CVA (Class Variance Authority)
 */
export const aiChatConversationItemActionsVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-1",
    "opacity-0",
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
