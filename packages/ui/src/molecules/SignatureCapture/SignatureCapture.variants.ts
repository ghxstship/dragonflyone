import { cva } from "class-variance-authority";

/**
 * SignatureCapture variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Signature capture with canvas and controls
 */
export const signatureCaptureVariants = cva(
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
 * SignatureCapture header variants using CVA (Class Variance Authority)
 */
export const signatureCaptureHeaderVariants = cva(
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
 * SignatureCapture title variants using CVA (Class Variance Authority)
 */
export const signatureCaptureTitleVariants = cva(
  [
    // Base styles
    "text-lg",
    "font-bold",
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
 * SignatureCapture document info variants using CVA (Class Variance Authority)
 */
export const signatureCaptureDocumentInfoVariants = cva(
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
 * SignatureCapture signer info variants using CVA (Class Variance Authority)
 */
export const signatureCaptureSignerInfoVariants = cva(
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
 * SignatureCapture canvas container variants using CVA (Class Variance Authority)
 */
export const signatureCaptureCanvasContainerVariants = cva(
  [
    // Base styles
    "p-4",
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
 * SignatureCapture canvas variants using CVA (Class Variance Authority)
 */
export const signatureCaptureCanvasVariants = cva(
  [
    // Base styles
    "w-full",
    "border-2",
    "border-dashed",
    "rounded-button",
    "cursor-crosshair",
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
 * SignatureCapture controls container variants using CVA (Class Variance Authority)
 */
export const signatureCaptureControlsContainerVariants = cva(
  [
    // Base styles
    "p-4",
    "border-t-2",
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
 * SignatureCapture actions container variants using CVA (Class Variance Authority)
 */
export const signatureCaptureActionsContainerVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-between",
    "gap-4",
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
 * SignatureCapture button variants using CVA (Class Variance Authority)
 */
export const signatureCaptureButtonVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "gap-2",
    "px-4",
    "py-2",
    "border-2",
    "rounded-button",
    "font-medium",
    "transition-all",
    "duration-[var(--duration-fast)]",
    "ease-[var(--easing-easeOut)]",
    "hover:scale-105",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
  ],
  {
    variants: {
      /**
       * Button variant
       */
      variant: {
        primary: "",
        secondary: "",
        danger: "",
      },
      
      /**
       * Disabled state
       */
      disabled: {
        true: "opacity-50 cursor-not-allowed",
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
      variant: "primary",
      disabled: false,
      inverted: false,
    },
    
    compoundVariants: [
      // Primary variant combinations
      {
        variant: "primary",
        inverted: true,
        class: "bg-brand-primary border-brand-primary text-white focus:ring-[var(--color-brand-primary)]",
      },
      {
        variant: "primary",
        inverted: false,
        class: "bg-brand-primary border-brand-primary text-white focus:ring-[var(--color-brand-primary)]",
      },
      
      // Secondary variant combinations
      {
        variant: "secondary",
        inverted: true,
        class: "bg-surface-elevated-inverse border-border-inverse text-text-secondary-inverse hover:bg-surface-hover-inverse focus:ring-[var(--color-brand-primary)]",
      },
      {
        variant: "secondary",
        inverted: false,
        class: "bg-surface-elevated border-border text-text-secondary hover:bg-surface-hover focus:ring-[var(--color-brand-primary)]",
      },
      
      // Danger variant combinations
      {
        variant: "danger",
        inverted: true,
        class: "bg-error-500 border-error-500 text-white focus:ring-[var(--color-error-500)]",
      },
      {
        variant: "danger",
        inverted: false,
        class: "bg-error-500 border-error-500 text-white focus:ring-[var(--color-error-500)]",
      },
    ],
  }
);

/**
 * SignatureCapture checkbox container variants using CVA (Class Variance Authority)
 */
export const signatureCaptureCheckboxContainerVariants = cva(
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
 * SignatureCapture checkbox label variants using CVA (Class Variance Authority)
 */
export const signatureCaptureCheckboxLabelVariants = cva(
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
        true: "text-text-inverse",
        false: "text-text-primary",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);
