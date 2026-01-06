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
    },
    defaultVariants: {
      variant: "default",
    },
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
    "bg-[var(--color-surface-primary)]",
    "border-[var(--color-border-default)]",
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
    },
    defaultVariants: {
      variant: "default",
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
        default: "bg-[var(--color-surface-elevated)] border-b-2 border-[var(--color-border-default)]",
        bordered: "bg-[var(--color-surface-elevated)] border-b-2 border-[var(--color-border-default)]",
        striped: "bg-[var(--color-surface-elevated)] border-b-2 border-[var(--color-border-default)]",
        dark: "bg-[var(--color-surface-elevated)] border-b-2 border-[var(--color-border-default)]",
        "dark-striped": "bg-[var(--color-surface-elevated)] border-b-2 border-[var(--color-border-default)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * TableBody variants using CVA (Class Variance Authority)
 */
export const tableBodyVariants = cva(
  [
    // Base styles
    "bg-[var(--color-surface-primary)]",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ]
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
        default: "border-b-2 border-[var(--color-border-default)]",
        bordered: "border-b-2 border-[var(--color-border-default)]",
        striped: "border-b-2 border-[var(--color-border-default)]",
        dark: "border-b-2 border-[var(--color-border-default)]",
        "dark-striped": "border-b-2 border-[var(--color-border-default)]",
      },
      
      /**
       * Hover state
       */
      hover: {
        true: "hover:bg-[var(--color-surface-hover)]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: true,
    },
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
    "text-[var(--color-text-primary)]",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ]
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
    "text-[var(--color-text-primary)]",
    "transition-colors",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ]
);
