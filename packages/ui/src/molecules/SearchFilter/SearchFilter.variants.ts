import { cva } from "class-variance-authority";

/**
 * SearchFilter variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Search and filter interface with dropdowns
 */
export const searchFilterVariants = cva(
  [
    // Base styles
    "flex",
    "flex-col",
    "gap-4",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Compact mode
       */
      compact: {
        true: "flex-row items-center",
        false: "flex-col",
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
      compact: false,
      inverted: false,
    },
  }
);

/**
 * SearchFilter search container variants using CVA (Class Variance Authority)
 */
export const searchFilterSearchContainerVariants = cva(
  [
    // Base styles
    "relative",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Compact mode
       */
      compact: {
        true: "flex-shrink-0",
        false: "w-full",
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
      compact: false,
      inverted: false,
    },
  }
);

/**
 * SearchFilter search input variants using CVA (Class Variance Authority)
 */
export const searchFilterSearchInputVariants = cva(
  [
    // Base styles
    "w-full",
    "pl-10",
    "pr-10",
    "py-2",
    "border-2",
    "rounded-button",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
    "focus:ring-[var(--color-brand-primary)]",
  ],
  {
    variants: {
      /**
       * Compact mode
       */
      compact: {
        true: "w-64",
        false: "w-full",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-surface-elevated-inverse border-border-inverse text-text-inverse placeholder-text-text-muted-inverse",
        false: "bg-surface-elevated border-border text-text-primary placeholder-text-text-muted",
      },
    },
    defaultVariants: {
      compact: false,
      inverted: false,
    },
  }
);

/**
 * SearchFilter search icon variants using CVA (Class Variance Authority)
 */
export const searchFilterSearchIconVariants = cva(
  [
    // Base styles
    "absolute",
    "left-3",
    "top-1/2",
    "-translate-y-1/2",
    "w-4",
    "h-4",
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
 * SearchFilter clear button variants using CVA (Class Variance Authority)
 */
export const searchFilterClearButtonVariants = cva(
  [
    // Base styles
    "absolute",
    "right-3",
    "top-1/2",
    "-translate-y-1/2",
    "p-1",
    "border-2",
    "rounded-button",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "hover:scale-110",
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
        true: "bg-surface-elevated-inverse border-border-inverse text-text-secondary-inverse hover:bg-surface-hover-inverse",
        false: "bg-surface-elevated border-border text-text-secondary hover:bg-surface-hover",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * SearchFilter filters container variants using CVA (Class Variance Authority)
 */
export const searchFilterFiltersContainerVariants = cva(
  [
    // Base styles
    "flex",
    "flex-wrap",
    "gap-3",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Compact mode
       */
      compact: {
        true: "flex-shrink-0",
        false: "w-full",
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
      compact: false,
      inverted: false,
    },
  }
);

/**
 * SearchFilter filter group variants using CVA (Class Variance Authority)
 */
export const searchFilterFilterGroupVariants = cva(
  [
    // Base styles
    "relative",
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
        true: "bg-surface-elevated-inverse border-border-inverse",
        false: "bg-surface-elevated border-border",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * SearchFilter filter trigger variants using CVA (Class Variance Authority)
 */
export const searchFilterFilterTriggerVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-between",
    "w-full",
    "px-4",
    "py-2",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "hover:bg-surface-hover",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-inset",
    "focus:ring-[var(--color-brand-primary)]",
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
 * SearchFilter filter label variants using CVA (Class Variance Authority)
 */
export const searchFilterFilterLabelVariants = cva(
  [
    // Base styles
    "text-sm",
    "font-medium",
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
 * SearchFilter filter count variants using CVA (Class Variance Authority)
 */
export const searchFilterFilterCountVariants = cva(
  [
    // Base styles
    "px-2",
    "py-1",
    "text-xs",
    "font-bold",
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
        true: "bg-brand-primary text-white",
        false: "bg-brand-primary text-white",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * SearchFilter filter dropdown variants using CVA (Class Variance Authority)
 */
export const searchFilterFilterDropdownVariants = cva(
  [
    // Base styles
    "absolute",
    "top-full",
    "left-0",
    "right-0",
    "z-50",
    "mt-1",
    "border-2",
    "rounded-[var(--radius-card)]",
    "shadow-hard",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "origin-top",
  ],
  {
    variants: {
      /**
       * Open state
       */
      open: {
        true: "opacity-100 scale-100",
        false: "opacity-0 scale-95 pointer-events-none",
      },
      
      /**
       * Theme inversion
       */
      inverted: {
        true: "bg-surface-primary-inverse border-border-inverse",
        false: "bg-surface-primary border-border",
      },
    },
    defaultVariants: {
      open: false,
      inverted: false,
    },
  }
);

/**
 * SearchFilter filter option variants using CVA (Class Variance Authority)
 */
export const searchFilterFilterOptionVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-between",
    "w-full",
    "px-4",
    "py-2",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "hover:bg-surface-hover",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-inset",
    "focus:ring-[var(--color-brand-primary)]",
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
 * SearchFilter filter option label variants using CVA (Class Variance Authority)
 */
export const searchFilterFilterOptionLabelVariants = cva(
  [
    // Base styles
    "flex-1",
    "text-sm",
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
 * SearchFilter filter option count variants using CVA (Class Variance Authority)
 */
export const searchFilterFilterOptionCountVariants = cva(
  [
    // Base styles
    "px-2",
    "py-1",
    "text-xs",
    "font-medium",
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
        true: "bg-surface-elevated-inverse text-text-secondary-inverse",
        false: "bg-surface-elevated text-text-secondary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * SearchFilter actions container variants using CVA (Class Variance Authority)
 */
export const searchFilterActionsContainerVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
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
 * SearchFilter action button variants using CVA (Class Variance Authority)
 */
export const searchFilterActionButtonVariants = cva(
  [
    // Base styles
    "px-3",
    "py-1.5",
    "border-2",
    "rounded-button",
    "text-sm",
    "font-medium",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "hover:scale-105",
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
        true: "bg-surface-elevated-inverse border-border-inverse text-text-secondary-inverse hover:bg-surface-hover-inverse",
        false: "bg-surface-elevated border-border text-text-secondary hover:bg-surface-hover",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);
