import { cva } from "class-variance-authority";

/**
 * FileUpload variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Drag and drop support
 */
export const fileUploadVariants = cva(
  [
    // Base styles
    "relative",
    "border-2",
    "border-dashed",
    "rounded-[var(--radius-card)]",
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
        true: "p-4",
        false: "p-8",
      },
      
      /**
       * Disabled state
       */
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "cursor-pointer",
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
      disabled: false,
      inverted: false,
    },
    
    compoundVariants: [
      // Normal state combinations
      {
        compact: false,
        disabled: false,
        inverted: true,
        class: "p-8 border-border-inverse bg-surface-inverse cursor-pointer hover:border-brand-primary",
      },
      {
        compact: false,
        disabled: false,
        inverted: false,
        class: "p-8 border-border bg-surface-primary cursor-pointer hover:border-brand-primary",
      },
      
      // Compact state combinations
      {
        compact: true,
        disabled: false,
        inverted: true,
        class: "p-4 border-border-inverse bg-surface-inverse cursor-pointer hover:border-brand-primary",
      },
      {
        compact: true,
        disabled: false,
        inverted: false,
        class: "p-4 border-border bg-surface-primary cursor-pointer hover:border-brand-primary",
      },
      
      // Disabled state combinations
      {
        compact: false,
        disabled: true,
        inverted: true,
        class: "p-8 border-border-inverse bg-surface-inverse opacity-50 cursor-not-allowed",
      },
      {
        compact: false,
        disabled: true,
        inverted: false,
        class: "p-8 border-border bg-surface-primary opacity-50 cursor-not-allowed",
      },
      
      {
        compact: true,
        disabled: true,
        inverted: true,
        class: "p-4 border-border-inverse bg-surface-inverse opacity-50 cursor-not-allowed",
      },
      {
        compact: true,
        disabled: true,
        inverted: false,
        class: "p-4 border-border bg-surface-primary opacity-50 cursor-not-allowed",
      },
    ],
  }
);

/**
 * FileUpload drag state variants using CVA (Class Variance Authority)
 */
export const fileUploadDragVariants = cva(
  [
    // Base styles
    "absolute",
    "inset-0",
    "flex",
    "items-center",
    "justify-center",
    "rounded-[var(--radius-card)]",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
  ],
  {
    variants: {
      /**
       * Drag active state
       */
      isDragActive: {
        true: "bg-brand-primary/10 border-brand-primary",
        false: "pointer-events-none",
      },
    },
    defaultVariants: {
      isDragActive: false,
    },
  }
);

/**
 * FileUpload content variants using CVA (Class Variance Authority)
 */
export const fileUploadContentVariants = cva(
  [
    // Base styles
    "flex",
    "flex-col",
    "items-center",
    "justify-center",
    "text-center",
    "space-y-2",
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
 * FileUpload icon variants using CVA (Class Variance Authority)
 */
export const fileUploadIconVariants = cva(
  [
    // Base styles
    "w-12",
    "h-12",
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
 * FileUpload text variants using CVA (Class Variance Authority)
 */
export const fileUploadTextVariants = cva(
  [
    // Base styles
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
 * FileUpload helper text variants using CVA (Class Variance Authority)
 */
export const fileUploadHelperVariants = cva(
  [
    // Base styles
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
        true: "text-text-muted-inverse",
        false: "text-text-muted",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);
