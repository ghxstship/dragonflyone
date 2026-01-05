import { cva } from "class-variance-authority";

/**
 * InvoicePreview variants using CVA (Class Variance Authority)
 * 
 * Uses CSS custom properties from the design token system for consistent
 * styling across themes and whitelabel configurations.
 * 
 * Features:
 * - Bold Contemporary Pop Art Adventure aesthetic
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Professional invoice layout
 */
export const invoicePreviewVariants = cva(
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
 * InvoicePreview header variants using CVA (Class Variance Authority)
 */
export const invoicePreviewHeaderVariants = cva(
  [
    // Base styles
    "p-6",
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
 * InvoicePreview company info variants using CVA (Class Variance Authority)
 */
export const invoicePreviewCompanyInfoVariants = cva(
  [
    // Base styles
    "flex",
    "items-start",
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
 * InvoicePreview logo variants using CVA (Class Variance Authority)
 */
export const invoicePreviewLogoVariants = cva(
  [
    // Base styles
    "w-16",
    "h-16",
    "rounded",
    "object-cover",
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
 * InvoicePreview company details variants using CVA (Class Variance Authority)
 */
export const invoicePreviewCompanyDetailsVariants = cva(
  [
    // Base styles
    "text-right",
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
 * InvoicePreview company name variants using CVA (Class Variance Authority)
 */
export const invoicePreviewCompanyNameVariants = cva(
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
 * InvoicePreview company address variants using CVA (Class Variance Authority)
 */
export const invoicePreviewCompanyAddressVariants = cva(
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
 * InvoicePreview content variants using CVA (Class Variance Authority)
 */
export const invoicePreviewContentVariants = cva(
  [
    // Base styles
    "p-6",
    "space-y-6",
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
 * InvoicePreview section variants using CVA (Class Variance Authority)
 */
export const invoicePreviewSectionVariants = cva(
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
 * InvoicePreview section title variants using CVA (Class Variance Authority)
 */
export const invoicePreviewSectionTitleVariants = cva(
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
 * InvoicePreview table variants using CVA (Class Variance Authority)
 */
export const invoicePreviewTableVariants = cva(
  [
    // Base styles
    "w-full",
    "border-2",
    "rounded-[var(--radius-card)]",
    "overflow-hidden",
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
 * InvoicePreview table header variants using CVA (Class Variance Authority)
 */
export const invoicePreviewTableHeaderVariants = cva(
  [
    // Base styles
    "bg-surface-hover",
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
        true: "bg-surface-hover-inverse border-border-inverse",
        false: "bg-surface-hover border-border",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * InvoicePreview table cell variants using CVA (Class Variance Authority)
 */
export const invoicePreviewTableCellVariants = cva(
  [
    // Base styles
    "px-4",
    "py-2",
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
        true: "text-text-inverse border-border-inverse",
        false: "text-text-primary border-border",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);

/**
 * InvoicePreview totals variants using CVA (Class Variance Authority)
 */
export const invoicePreviewTotalsVariants = cva(
  [
    // Base styles
    "flex",
    "flex-col",
    "items-end",
    "gap-2",
    "mt-6",
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
 * InvoicePreview total row variants using CVA (Class Variance Authority)
 */
export const invoicePreviewTotalRowVariants = cva(
  [
    // Base styles
    "flex",
    "items-center",
    "justify-between",
    "gap-4",
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
 * InvoicePreview total label variants using CVA (Class Variance Authority)
 */
export const invoicePreviewTotalLabelVariants = cva(
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
 * InvoicePreview total value variants using CVA (Class Variance Authority)
 */
export const invoicePreviewTotalValueVariants = cva(
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
 * InvoicePreview footer variants using CVA (Class Variance Authority)
 */
export const invoicePreviewFooterVariants = cva(
  [
    // Base styles
    "p-6",
    "border-t-2",
    "space-y-4",
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
 * InvoicePreview notes variants using CVA (Class Variance Authority)
 */
export const invoicePreviewNotesVariants = cva(
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
 * InvoicePreview terms variants using CVA (Class Variance Authority)
 */
export const invoicePreviewTermsVariants = cva(
  [
    // Base styles
    "text-xs",
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
        true: "text-text-muted-inverse",
        false: "text-text-muted",
      },
    },
    defaultVariants: {
      inverted: false,
    },
  }
);
