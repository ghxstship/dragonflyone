import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const notificationCenterVariants = cva("relative w-container-md max-h-[80vh] bg-surface-primary border-2 border-border-primary rounded-modal shadow-xl overflow-hidden animate-slide-up-bounce m-spacing-4", {
  variants: {
    position: {
      "top-right": "top-0 right-0 ml-auto",
      "top-left": "top-0 left-0 mr-auto",
      "bottom-right": "bottom-0 right-0 ml-auto",
      "bottom-left": "bottom-0 left-0 mr-auto",
    },
  },
  defaultVariants: {
    position: "top-right",
  },
});

export const notificationBellVariants = cva("relative p-spacing-2 text-text-disabled hover:text-text-primary bg-transparent border-none cursor-pointer transition-colors", {
  variants: {
    hasUnread: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    hasUnread: false,
  },
});

export type NotificationCenterVariants = VariantProps<typeof notificationCenterVariants>;
export type NotificationBellVariants = VariantProps<typeof notificationBellVariants>;
