import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const aiChatLayoutVariants = cva("flex h-screen flex-col", {
  variants: {
    inverted: {
      true: "bg-surface-inverse",
      false: "bg-surface-primary",
    },
  },
  defaultVariants: {
    inverted: false,
  },
});

export const aiChatHeaderVariants = cva("flex h-14 shrink-0 items-center justify-between border-b-2 px-4", {
  variants: {
    inverted: {
      true: "border-border bg-surface-elevated",
      false: "border-border bg-surface-primary",
    },
  },
  defaultVariants: {
    inverted: false,
  },
});

export const aiChatSidebarVariants = cva("flex h-full flex-col", {
  variants: {
    inverted: {
      true: "bg-surface-elevated",
      false: "bg-muted",
    },
  },
  defaultVariants: {
    inverted: false,
  },
});

export const aiChatMainVariants = cva("flex h-full flex-col", {
  variants: {
    inverted: {
      true: "bg-surface-inverse",
      false: "bg-surface-primary",
    },
  },
  defaultVariants: {
    inverted: false,
  },
});

export const aiChatArtifactVariants = cva("flex h-full flex-col", {
  variants: {
    inverted: {
      true: "bg-surface-elevated",
      false: "bg-surface-primary",
    },
  },
  defaultVariants: {
    inverted: false,
  },
});

export type AIChatLayoutVariants = VariantProps<typeof aiChatLayoutVariants>;
export type AIChatHeaderVariants = VariantProps<typeof aiChatHeaderVariants>;
export type AIChatSidebarVariants = VariantProps<typeof aiChatSidebarVariants>;
export type AIChatMainVariants = VariantProps<typeof aiChatMainVariants>;
export type AIChatArtifactVariants = VariantProps<typeof aiChatArtifactVariants>;
