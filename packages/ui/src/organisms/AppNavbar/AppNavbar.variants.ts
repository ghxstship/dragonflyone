import { cva } from "class-variance-authority";

export const appNavbarVariants = cva(
  // Base styles
  "flex items-center justify-between w-full border-b transition-all duration-200",
  {
    variants: {
      sticky: {
        true: "sticky top-0 z-50 backdrop-blur-sm",
        false: "relative",
      },
      inverted: {
        true: "bg-surface-inverse/95 border-border-inverse text-text-primary",
        false: "bg-surface-primary/95 border-border text-text-primary",
      },
      compact: {
        true: "h-12 px-4",
        false: "h-16 px-6",
      },
    },
    defaultVariants: {
      sticky: true,
      inverted: false,
      compact: false,
    },
  }
);

export const navItemVariants = cva(
  // Base styles
  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
  {
    variants: {
      active: {
        true: "bg-primary-100 text-primary-700",
        false: "text-text-muted hover:text-text-primary hover:bg-surface-secondary",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "cursor-pointer",
      },
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      active: false,
      disabled: false,
      inverted: false,
    },
  }
);

export const notificationVariants = cva(
  // Base styles
  "flex items-start gap-3 p-3 rounded-lg border transition-all duration-200",
  {
    variants: {
      type: {
        info: "bg-info-subtle border-info text-info",
        success: "bg-success-subtle border-success text-success",
        warning: "bg-warning-subtle border-warning text-warning",
        error: "bg-error-subtle border-error text-error",
      },
      read: {
        true: "opacity-60",
        false: "opacity-100",
      },
      inverted: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      type: "info",
      read: false,
      inverted: false,
    },
  }
);
