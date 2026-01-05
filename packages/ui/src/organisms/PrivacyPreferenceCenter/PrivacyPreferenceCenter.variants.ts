import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const privacyPreferenceCenterVariants = cva("", {
  variants: {
    region: {
      gdpr: "",
      ccpa: "",
      lgpd: "",
      pipeda: "",
      default: "",
    },
    loading: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    region: "default",
    loading: false,
  },
});

export type PrivacyPreferenceCenterVariants = VariantProps<typeof privacyPreferenceCenterVariants>;
