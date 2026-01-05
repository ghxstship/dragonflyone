import { cva } from "class-variance-authority";

export const aiChatMessageVariants = cva(
  // Base styles
  "flex gap-3 p-4 transition-all duration-200",
  {
    variants: {
      role: {
        user: "flex-row-reverse",
        assistant: "flex-row",
        system: "flex-row",
      },
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      role: "user",
      inverted: false,
    },
  }
);

export const messageBubbleVariants = cva(
  // Base styles
  "max-w-[70%] rounded-lg px-4 py-3 transition-all duration-200",
  {
    variants: {
      role: {
        user: "bg-primary-500 text-white",
        assistant: "bg-surface-secondary text-text-primary",
        system: "bg-muted text-text-muted",
      },
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      role: "user",
      inverted: false,
    },
  }
);

export const messageActionsVariants = cva(
  // Base styles
  "flex items-center gap-1 opacity-0 transition-opacity duration-200",
  {
    variants: {
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

export const typingIndicatorVariants = cva(
  // Base styles
  "flex gap-3 p-4",
  {
    variants: {
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
