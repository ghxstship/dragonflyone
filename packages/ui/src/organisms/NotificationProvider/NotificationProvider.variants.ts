import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const notificationProviderVariants = cva("pointer-events-none fixed z-modal flex flex-col gap-gap-md p-spacing-6", {
  variants: {
    position: {
      "top-right": "top-0 right-0",
      "top-left": "top-0 left-0",
      "bottom-right": "bottom-0 right-0",
      "bottom-left": "bottom-0 left-0",
      "top-center": "top-0 left-1/2 -translate-x-1/2",
      "bottom-center": "bottom-0 left-1/2 -translate-x-1/2",
    },
  },
  defaultVariants: {
    position: "bottom-right",
  },
});

export type NotificationProviderVariants = VariantProps<typeof notificationProviderVariants>;
