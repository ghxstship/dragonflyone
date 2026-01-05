import { cva } from "class-variance-authority";

/**
 * SectionHeader variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Section header with kicker, title, and description
 */
export const sectionHeaderVariants = cva(
  [
    // Base styles
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Text alignment
       */
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      align: "left",
      inverted: false,
    },
  }
);

/**
 * SectionHeader container variants using CVA (Class Variance Authority)
 */
export const sectionHeaderContainerVariants = cva(
  [
    // Base styles
    "space-y-4",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Gap variant
       */
      gap: {
        sm: "space-y-2",
        md: "space-y-4",
        lg: "space-y-6",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      gap: "md",
      inverted: false,
    },
  }
);

/**
 * SectionHeader kicker variants using CVA (Class Variance Authority)
 */
export const sectionHeaderKickerVariants = cva(
  [
    // Base styles
    "text-sm",
    "font-bold",
    "uppercase",
    "tracking-wider",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Color scheme
       */
      colorScheme: {
        "on-dark": "text-text-muted",
        "on-light": "text-text-muted",
        "on-mid": "text-text-muted",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "text-text-muted-inverse",
        false: "",
      },
    },
    defaultVariants: {
      colorScheme: "on-dark",
      inverted: false,
    },
    
    compoundVariants: [
      // Color scheme with inversion combinations
      {
        colorScheme: "on-dark",
        inverted: true,
        class: "text-text-muted-inverse",
      },
      {
        colorScheme: "on-light",
        inverted: true,
        class: "text-text-muted-inverse",
      },
      {
        colorScheme: "on-mid",
        inverted: true,
        class: "text-text-muted-inverse",
      },
    ],
  }
);

/**
 * SectionHeader title variants using CVA (Class Variance Authority)
 */
export const sectionHeaderTitleVariants = cva(
  [
    // Base styles
    "font-bold",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Title size
       */
      titleSize: {
        md: "text-2xl",
        lg: "text-3xl",
        xl: "text-4xl",
      },
      
      /**
       * Color scheme
       */
      colorScheme: {
        "on-dark": "text-text-primary",
        "on-light": "text-text-primary",
        "on-mid": "text-text-primary",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "text-text-primary-inverse",
        false: "",
      },
    },
    defaultVariants: {
      titleSize: "lg",
      colorScheme: "on-dark",
      inverted: false,
    },
    
    compoundVariants: [
      // Color scheme with inversion combinations
      {
        colorScheme: "on-dark",
        inverted: true,
        class: "text-text-primary-inverse",
      },
      {
        colorScheme: "on-light",
        inverted: true,
        class: "text-text-primary-inverse",
      },
      {
        colorScheme: "on-mid",
        inverted: true,
        class: "text-text-primary-inverse",
      },
    ],
  }
);

/**
 * SectionHeader description variants using CVA (Class Variance Authority)
 */
export const sectionHeaderDescriptionVariants = cva(
  [
    // Base styles
    "text-base",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Color scheme
       */
      colorScheme: {
        "on-dark": "text-text-secondary",
        "on-light": "text-text-secondary",
        "on-mid": "text-text-secondary",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "text-text-secondary-inverse",
        false: "",
      },
    },
    defaultVariants: {
      colorScheme: "on-dark",
      inverted: false,
    },
    
    compoundVariants: [
      // Color scheme with inversion combinations
      {
        colorScheme: "on-dark",
        inverted: true,
        class: "text-text-secondary-inverse",
      },
      {
        colorScheme: "on-light",
        inverted: true,
        class: "text-text-secondary-inverse",
      },
      {
        colorScheme: "on-mid",
        inverted: true,
        class: "text-text-secondary-inverse",
      },
    ],
  }
);
