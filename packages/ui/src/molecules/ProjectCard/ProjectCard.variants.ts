import { cva } from "class-variance-authority";

/**
 * ProjectCard variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Project card with image and metadata
 */
export const projectCardVariants = cva(
  [
    // Base styles
    "group",
    "border-2",
    "rounded-[var(--radius-card)]",
    "shadow-hard",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "hover:scale-105",
    "hover:shadow-hard",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
    "focus:ring-[var(--color-brand-primary)]",
  ],
  {
    variants: {
      /**
       * Interactive state
       */
      interactive: {
        true: "cursor-pointer",
        false: "cursor-default",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-surface-elevated-inverse border-border-inverse",
        false: "bg-surface-elevated border-border",
      },
    },
    defaultVariants: {
      interactive: true,
      inverted: false,
    },
  }
);

/**
 * ProjectCard image container variants using CVA (Class Variance Authority)
 */
export const projectCardImageContainerVariants = cva(
  [
    // Base styles
    "relative",
    "overflow-hidden",
    "aspect-[4/3]",
    "transition-transform",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-surface-primary-inverse",
        false: "bg-surface-primary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * ProjectCard image variants using CVA (Class Variance Authority)
 */
export const projectCardImageVariants = cva(
  [
    // Base styles
    "w-full",
    "h-full",
    "object-cover",
    "grayscale",
    "contrast-125",
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
 * ProjectCard image overlay variants using CVA (Class Variance Authority)
 */
export const projectCardImageOverlayVariants = cva(
  [
    // Base styles
    "absolute",
    "inset-0",
    "transition-opacity",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-surface-overlay-inverse opacity-0 group-hover:opacity-100",
        false: "bg-surface-overlay opacity-0 group-hover:opacity-100",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * ProjectCard content variants using CVA (Class Variance Authority)
 */
export const projectCardContentVariants = cva(
  [
    // Base styles
    "p-4",
    "border-2",
    "border-t-0",
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
        true: "border-border-inverse",
        false: "border-border",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * ProjectCard title variants using CVA (Class Variance Authority)
 */
export const projectCardTitleVariants = cva(
  [
    // Base styles
    "font-bold",
    "text-lg",
    "uppercase",
    "tracking-wider",
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
 * ProjectCard metadata variants using CVA (Class Variance Authority)
 */
export const projectCardMetadataVariants = cva(
  [
    // Base styles
    "text-xs",
    "font-mono",
    "uppercase",
    "tracking-widest",
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
        true: "text-text-muted-inverse",
        false: "text-text-muted",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * ProjectCard tags container variants using CVA (Class Variance Authority)
 */
export const projectCardTagsContainerVariants = cva(
  [
    // Base styles
    "flex",
    "flex-wrap",
    "gap-2",
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
 * ProjectCard tag variants using CVA (Class Variance Authority)
 */
export const projectCardTagVariants = cva(
  [
    // Base styles
    "px-2",
    "py-1",
    "border-2",
    "text-xs",
    "font-mono",
    "uppercase",
    "tracking-widest",
    "rounded-badge",
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
        true: "bg-surface-elevated-inverse border-border-inverse text-text-secondary-inverse",
        false: "bg-surface-elevated border-border text-text-secondary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);
