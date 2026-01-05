import { cva } from "class-variance-authority";

/**
 * Typography variants using CVA (Class Variance Authority)
 * 
 * Updated to use CSS custom properties for fluid responsive typography
 * and industry best practices compliance.
 */

// Display variants - for hero headlines with fluid scaling
export const displayVariants = cva(
  [
    "font-display",
    "uppercase",
    "tracking-tighter",
    "text-text-primary",
  ],
  {
    variants: {
      size: {
        xl: "text-[var(--font-size-display-xl)] leading-[var(--line-height-display-xl)]",
        lg: "text-[var(--font-size-display-lg)] leading-[var(--line-height-display-lg)]",
        md: "text-[var(--font-size-display-md)] leading-[var(--line-height-display-md)]",
        sm: "text-[var(--font-size-display-sm)] leading-[var(--line-height-display-sm)]",
        xs: "text-[var(--font-size-display-xs)] leading-[var(--line-height-display-xs)]",
      },
    },
    defaultVariants: {
      size: "lg",
    },
  }
);

// Heading variants (H1-H6) with fluid scaling and proper line heights
export const headingVariants = cva(
  [
    "font-heading",
    "uppercase",
    "tracking-wider",
    "text-text-primary",
  ],
  {
    variants: {
      level: {
        h1: [
          "tracking-tight",
          "text-[var(--font-size-h1-md)]",
          "leading-[var(--line-height-h1-md)]",
        ],
        h2: [
          "text-[var(--font-size-h2-md)]",
          "leading-[var(--line-height-h2-md)]",
        ],
        h3: [
          "text-[var(--font-size-h3-md)]",
          "leading-[var(--line-height-h3-md)]",
        ],
        h4: [
          "text-[var(--font-size-h4-md)]",
          "leading-[var(--line-height-h4-md)]",
        ],
        h5: [
          "text-[var(--font-size-h5-md)]",
          "leading-[var(--line-height-h5-md)]",
        ],
        h6: [
          "text-[var(--font-size-h6-md)]",
          "leading-[var(--line-height-h6-md)]",
        ],
      },
      size: {
        xl: "text-[length:--font-size-{level}-xl] leading-[length:--line-height-{level}-xl]",
        lg: "text-[length:--font-size-{level}-lg] leading-[length:--line-height-{level}-lg]",
        md: "text-[length:--font-size-{level}-md] leading-[length:--line-height-{level}-md]",
        sm: "text-[length:--font-size-{level}-sm] leading-[length:--line-height-{level}-sm]",
      },
    },
    defaultVariants: {
      level: "h2",
      size: "md",
    },
  }
);

// Body text variants with accessible minimum font sizes
export const bodyVariants = cva(
  [
    "font-body",
    "leading-[var(--line-height-body-md)]",
    "text-text-primary",
  ],
  {
    variants: {
      size: {
        lg: "text-[var(--font-size-body-lg)] leading-[var(--line-height-body-lg)]",
        md: "text-[var(--font-size-body-md)] leading-[var(--line-height-body-md)]",
        sm: "text-[var(--font-size-body-sm)] leading-[var(--line-height-body-sm)]",
        xs: "text-[var(--font-size-body-xs)] leading-[var(--line-height-body-xs)]",
      },
      variant: {
        default: "text-text-primary",
        muted: "text-text-secondary",
        subtle: "text-text-secondary",
        inverted: "text-text-inverse",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

// Label/Mono variants with proper accessibility support
export const labelVariants = cva(
  [
    "font-mono",
    "tracking-widest",
    "leading-[var(--line-height-label-md)]",
    "text-text-primary",
  ],
  {
    variants: {
      size: {
        lg: "text-[var(--font-size-label-lg)] leading-[var(--line-height-label-lg)]",
        md: "text-[var(--font-size-label-md)] leading-[var(--line-height-label-md)]",
        sm: "text-[var(--font-size-label-sm)] leading-[var(--line-height-label-sm)]",
        xs: "text-[var(--font-size-label-xs)] leading-[var(--line-height-label-xs)]",
        xxs: "text-[var(--font-size-label-xxs)] leading-[var(--line-height-label-xxs)]",
      },
      uppercase: {
        true: "uppercase",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      uppercase: true,
    },
  }
);

// Additional responsive variants for mobile-first design
export const responsiveVariants = cva(
  [],
  {
    variants: {
      responsive: {
        true: "text-[clamp(1rem, 2.5vw, 1.125rem)]",
        false: "",
      },
    },
    defaultVariants: {
      responsive: false,
    },
  }
);

// Accessibility variants for reduced motion and high contrast
export const accessibilityVariants = cva(
  [],
  {
    variants: {
      reducedMotion: {
        true: "motion-reduce:transition-none motion-reduce:animate-none",
        false: "",
      },
      highContrast: {
        true: "contrast-more:border-current contrast-more:text-current",
        false: "",
      },
    },
    defaultVariants: {
      reducedMotion: false,
      highContrast: false,
    },
  }
);

export type DisplayVariantProps = Parameters<typeof displayVariants>[0];
export type HeadingVariantProps = Parameters<typeof headingVariants>[0];
export type BodyVariantProps = Parameters<typeof bodyVariants>[0];
export type LabelVariantProps = Parameters<typeof labelVariants>[0];
export type ResponsiveVariantProps = Parameters<typeof responsiveVariants>[0];
export type AccessibilityVariantProps = Parameters<typeof accessibilityVariants>[0];
