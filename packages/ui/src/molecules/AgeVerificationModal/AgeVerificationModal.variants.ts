import { cva } from "class-variance-authority";

/**
 * AgeVerificationModal variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Age gate compliance styling
 */
export const ageVerificationModalVariants = cva(
  [
    // Base styles
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
 * AgeVerificationModal content variants using CVA (Class Variance Authority)
 */
export const ageVerificationModalContentVariants = cva(
  [
    // Base styles
    "flex",
    "flex-col",
    "items-center",
    "text-center",
    "p-6",
    "space-y-4",
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
 * AgeVerificationModal icon variants using CVA (Class Variance Authority)
 */
export const ageVerificationModalIconVariants = cva(
  [
    // Base styles
    "w-16",
    "h-16",
    "mb-4",
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
        true: "text-warning-400",
        false: "text-warning-600",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * AgeVerificationModal title variants using CVA (Class Variance Authority)
 */
export const ageVerificationModalTitleVariants = cva(
  [
    // Base styles
    "text-2xl",
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
 * AgeVerificationModal description variants using CVA (Class Variance Authority)
 */
export const ageVerificationModalDescriptionVariants = cva(
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
 * AgeVerificationModal form variants using CVA (Class Variance Authority)
 */
export const ageVerificationModalFormVariants = cva(
  [
    // Base styles
    "w-full",
    "space-y-4",
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
 * AgeVerificationModal button group variants using CVA (Class Variance Authority)
 */
export const ageVerificationModalButtonGroupVariants = cva(
  [
    // Base styles
    "flex",
    "gap-3",
    "mt-6",
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
