import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const cookieConsentBannerVariants = cva("fixed z-modal animate-slide-up-bounce", {
  variants: {
    position: {
      bottom: "bottom-0 left-0 right-0 border-y-4 border-black bg-white shadow-[0_-8px_0_rgba(0,0,0,0.1)]",
      "bottom-left": "bottom-4 left-4 max-w-lg border-4 border-black bg-white rounded-[var(--radius-modal)] shadow-[8px_8px_0_rgba(0,0,0,0.2)]",
      "bottom-right": "bottom-4 right-4 max-w-lg border-4 border-black bg-white rounded-[var(--radius-modal)] shadow-[8px_8px_0_rgba(0,0,0,0.2)]",
      top: "top-0 left-0 right-0 border-y-4 border-black bg-white shadow-[0_-8px_0_rgba(0,0,0,0.1)]",
    },
  },
  defaultVariants: {
    position: "bottom",
  },
});

export type CookieConsentBannerVariants = VariantProps<typeof cookieConsentBannerVariants>;
