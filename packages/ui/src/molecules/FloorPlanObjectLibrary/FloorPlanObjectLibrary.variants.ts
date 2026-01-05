import { cva } from "class-variance-authority";

/**
 * FloorPlanObjectLibrary variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Object library grid
 */
export const floorPlanObjectLibraryVariants = cva(
  [
    // Base styles
    "border-2",
    "rounded-[var(--radius-card)]",
    "shadow-hard",
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
        true: "bg-surface-primary-inverse border-border-inverse",
        false: "bg-surface-primary border-border",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * FloorPlanObjectLibrary header variants using CVA (Class Variance Authority)
 */
export const floorPlanObjectLibraryHeaderVariants = cva(
  [
    // Base styles
    "p-4",
    "border-b-2",
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
 * FloorPlanObjectLibrary title variants using CVA (Class Variance Authority)
 */
export const floorPlanObjectLibraryTitleVariants = cva(
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
 * FloorPlanObjectLibrary content variants using CVA (Class Variance Authority)
 */
export const floorPlanObjectLibraryContentVariants = cva(
  [
    // Base styles
    "p-4",
    "max-h-96",
    "overflow-y-auto",
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
 * FloorPlanObjectLibrary category variants using CVA (Class Variance Authority)
 */
export const floorPlanObjectLibraryCategoryVariants = cva(
  [
    // Base styles
    "mb-4",
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
 * FloorPlanObjectLibrary category title variants using CVA (Class Variance Authority)
 */
export const floorPlanObjectLibraryCategoryTitleVariants = cva(
  [
    // Base styles
    "text-xs",
    "font-bold",
    "uppercase",
    "tracking-wider",
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
 * FloorPlanObjectLibrary grid variants using CVA (Class Variance Authority)
 */
export const floorPlanObjectLibraryGridVariants = cva(
  [
    // Base styles
    "grid",
    "grid-cols-2",
    "gap-3",
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
 * FloorPlanObjectLibrary item variants using CVA (Class Variance Authority)
 */
export const floorPlanObjectLibraryItemVariants = cva(
  [
    // Base styles
    "flex",
    "flex-col",
    "items-center",
    "gap-2",
    "p-3",
    "border-2",
    "rounded-[var(--radius-card)]",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "cursor-pointer",
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
       * Theme inversion
       */
      inverted: {
        true: "bg-surface-elevated-inverse border-border-inverse hover:bg-surface-hover-inverse",
        false: "bg-surface-elevated border-border hover:bg-surface-hover",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * FloorPlanObjectLibrary icon variants using CVA (Class Variance Authority)
 */
export const floorPlanObjectLibraryIconVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-center",
    "w-8",
    "h-8",
    "rounded",
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
 * FloorPlanObjectLibrary name variants using CVA (Class Variance Authority)
 */
export const floorPlanObjectLibraryNameVariants = cva(
  [
    // Base styles
    "text-xs",
    "font-medium",
    "text-center",
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
