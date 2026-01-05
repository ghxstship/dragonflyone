import { cva } from "class-variance-authority";

/**
 * Table variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Table with various styling variants
 */
export const tableVariants = cva(
  [
    // Base styles
    "w-full",
    "text-left",
    "text-sm",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Table variant
       */
      variant: {
        default: "",
        bordered: "",
        striped: "",
        dark: "",
        "dark-striped": "",
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
      variant: "default",
      inverted: false,
    },
    
    compoundVariants: [
      // Striped variants
      {
        variant: "striped",
        inverted: true,
        class: "[&_tbody_tr:nth-child(even)]:bg-surface-elevated-inverse",
      },
      {
        variant: "striped",
        inverted: false,
        class: "[&_tbody_tr:nth-child(even)]:bg-surface-elevated",
      },
      
      // Dark striped variants
      {
        variant: "dark-striped",
        inverted: true,
        class: "[&_tbody_tr:nth-child(even)]:bg-surface-elevated-inverse",
      },
      {
        variant: "dark-striped",
        inverted: false,
        class: "[&_tbody_tr:nth-child(even)]:bg-surface-elevated",
      },
    ],
  }
);

/**
 * Table container variants using CVA (Class Variance Authority)
 */
export const tableContainerVariants = cva(
  [
    // Base styles
    "w-full",
    "overflow-x-auto",
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
       * Table variant
       */
      variant: {
        default: "",
        bordered: "",
        striped: "",
        dark: "",
        "dark-striped": "",
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
      variant: "default",
      inverted: false,
    },
  }
);

/**
 * TableHeader variants using CVA (Class Variance Authority)
 */
export const tableHeaderVariants = cva(
  [
    // Base styles
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Table variant
       */
      variant: {
        default: "bg-surface-elevated border-b-2",
        bordered: "bg-surface-elevated border-b-2",
        striped: "bg-surface-elevated border-b-2",
        dark: "bg-surface-elevated-inverse border-b-2",
        "dark-striped": "bg-surface-elevated-inverse border-b-2",
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
      variant: "default",
      inverted: false,
    },
    
    compoundVariants: [
      // Variant with inversion combinations
      {
        variant: "default",
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse",
      },
      {
        variant: "bordered",
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse",
      },
      {
        variant: "striped",
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse",
      },
      {
        variant: "dark",
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse",
      },
      {
        variant: "dark-striped",
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse",
      },
    ],
  }
);

/**
 * TableBody variants using CVA (Class Variance Authority)
 */
export const tableBodyVariants = cva(
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
 * TableRow variants using CVA (Class Variance Authority)
 */
export const tableRowVariants = cva(
  [
    // Base styles
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Table variant
       */
      variant: {
        default: "border-b-2",
        bordered: "border-b-2",
        striped: "border-b-2",
        dark: "border-b-2",
        "dark-striped": "border-b-2",
      },
      
      /**
       * Hover state
       */
      hover: {
        true: "hover:bg-surface-hover",
        false: "",
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
      variant: "default",
      hover: true,
      inverted: false,
    },
    
    compoundVariants: [
      // Variant with inversion combinations
      {
        variant: "default",
        inverted: true,
        class: "border-border-inverse",
      },
      {
        variant: "bordered",
        inverted: true,
        class: "border-border-inverse",
      },
      {
        variant: "striped",
        inverted: true,
        class: "border-border-inverse",
      },
      {
        variant: "dark",
        inverted: true,
        class: "border-border-inverse",
      },
      {
        variant: "dark-striped",
        inverted: true,
        class: "border-border-inverse",
      },
      
      // Hover with inversion combinations
      {
        hover: true,
        inverted: true,
        class: "hover:bg-surface-hover-inverse",
      },
    ],
  }
);

/**
 * TableHead variants using CVA (Class Variance Authority)
 */
export const tableHeadVariants = cva(
  [
    // Base styles
    "px-4",
    "py-3",
    "text-left",
    "font-bold",
    "text-xs",
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
        true: "text-text-primary-inverse",
        false: "text-text-primary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * TableCell variants using CVA (Class Variance Authority)
 */
export const tableCellVariants = cva(
  [
    // Base styles
    "px-4",
    "py-3",
    "text-left",
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
