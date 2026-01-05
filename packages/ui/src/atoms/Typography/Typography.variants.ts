import { cva } from "class-variance-authority";

/**
 * Typography variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 */

// Display variants - for hero headlines
export const displayVariants = cva(
  [
    "font-display",
    "uppercase",
    "tracking-tighter",
    "text-[var(--font-size-display)]",
    "leading-[var(--line-height-display)]",
    "text-[var(--color-text-primary)]",
  ],
  {
    variants: {
      size: {
        xl: "text-[var(--font-size-display-xl)]",
        lg: "text-[var(--font-size-display-lg)]",
        md: "text-[var(--font-size-display-md)]",
        sm: "text-[var(--font-size-display-sm)]",
        xs: "text-[var(--font-size-display-xs)]",
      },
    },
    defaultVariants: {
      size: "lg",
    },
  }
);

// Heading variants (H1-H6)
export const headingVariants = cva(
  [
    "font-heading",
    "uppercase",
    "tracking-wider",
    "text-[var(--color-text-primary)]",
  ],
  {
    variants: {
      level: {
        h1: [
          "tracking-tight",
          "text-[var(--font-size-h1)]",
          "leading-[var(--line-height-h1)]",
        ],
        h2: [
          "leading-[var(--line-height-h2)]",
          "text-[var(--font-size-h2)]",
        ],
        h3: [
          "leading-[var(--line-height-h3)]",
          "text-[var(--font-size-h3)]",
        ],
        h4: [
          "leading-[var(--line-height-h4)]",
          "text-[var(--font-size-h4)]",
        ],
        h5: [
          "leading-[var(--line-height-h5)]",
          "text-[var(--font-size-h5)]",
        ],
        h6: [
          "leading-[var(--line-height-h6)]",
          "text-[var(--font-size-h6)]",
        ],
      },
      size: {
        lg: "text-[length:--font-size-{level}-lg]",
        md: "text-[length:--font-size-{level}-md]",
        sm: "text-[length:--font-size-{level}-sm]",
      },
    },
    defaultVariants: {
      level: "h2",
      size: "md",
    },
  }
);

// Body text variants
export const bodyVariants = cva(
  [
    "font-body",
    "leading-[var(--line-height-body)]",
    "text-[var(--color-text-primary)]",
  ],
  {
    variants: {
      size: {
        lg: "text-[var(--font-size-body-lg)]",
        md: "text-[var(--font-size-body-md)]",
        sm: "text-[var(--font-size-body-sm)]",
        xs: "text-[var(--font-size-body-xs)]",
      },
      variant: {
        default: "text-[var(--color-text-primary)]",
        muted: "text-[var(--color-text-secondary)]",
        subtle: "text-[var(--color-text-secondary)]",
        inverted: "text-[var(--color-text-inverted)]",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

// Label/Mono variants
export const labelVariants = cva(
  [
    "font-code",
    "tracking-widest",
    "leading-[var(--line-height-label)]",
    "text-[var(--color-text-primary)]",
  ],
  {
    variants: {
      size: {
        lg: "text-[var(--font-size-label-lg)]",
        md: "text-[var(--font-size-label-md)]",
        sm: "text-[var(--font-size-label-sm)]",
        xs: "text-[var(--font-size-label-xs)]",
        xxs: "text-[var(--font-size-label-xxs)]",
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

export type DisplayVariantProps = Parameters<typeof displayVariants>[0];
export type HeadingVariantProps = Parameters<typeof headingVariants>[0];
export type BodyVariantProps = Parameters<typeof bodyVariants>[0];
export type LabelVariantProps = Parameters<typeof labelVariants>[0];
