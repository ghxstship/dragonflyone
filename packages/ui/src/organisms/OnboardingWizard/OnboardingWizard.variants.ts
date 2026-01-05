import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const onboardingWizardVariants = cva("min-h-screen bg-surface-primary flex flex-col", {
  variants: {
    step: {
      welcome: "",
      profile: "",
      preferences: "",
      completion: "",
    },
  },
  defaultVariants: {
    step: "welcome",
  },
});

export type OnboardingWizardVariants = VariantProps<typeof onboardingWizardVariants>;
