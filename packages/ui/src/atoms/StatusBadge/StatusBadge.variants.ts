import { cva } from "class-variance-authority";

export const statusBadgeVariants = cva(
  // Base styles
  "inline-flex items-center font-code uppercase tracking-widest leading-none font-bold rounded-[var(--radius-badge)]",
  {
    variants: {
      status: {
        success: "",
        error: "",
        warning: "",
        info: "",
        neutral: "",
        active: "",
        inactive: "",
        pending: "",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-3 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
      filled: {
        true: "",
        false: "",
      },
      inverted: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      // Light mode - success
      {
        status: "success",
        filled: true,
        inverted: false,
        class: "bg-success-500 text-white",
      },
      {
        status: "success",
        filled: false,
        inverted: false,
        class: "bg-success-50 border-2 border-success-500 text-success-700",
      },
      // Light mode - error
      {
        status: "error",
        filled: true,
        inverted: false,
        class: "bg-error-500 text-white",
      },
      {
        status: "error",
        filled: false,
        inverted: false,
        class: "bg-error-50 border-2 border-error-500 text-error-700",
      },
      // Light mode - warning
      {
        status: "warning",
        filled: true,
        inverted: false,
        class: "bg-warning-500 text-white",
      },
      {
        status: "warning",
        filled: false,
        inverted: false,
        class: "bg-warning-50 border-2 border-warning-500 text-warning-700",
      },
      // Light mode - info
      {
        status: "info",
        filled: true,
        inverted: false,
        class: "bg-info-500 text-white",
      },
      {
        status: "info",
        filled: false,
        inverted: false,
        class: "bg-info-50 border-2 border-info-500 text-info-700",
      },
      // Light mode - neutral
      {
        status: "neutral",
        filled: true,
        inverted: false,
        class: "bg-muted text-text-primary",
      },
      {
        status: "neutral",
        filled: false,
        inverted: false,
        class: "bg-muted border-2 border-border text-text-disabled",
      },
      // Light mode - active
      {
        status: "active",
        filled: true,
        inverted: false,
        class: "bg-success-500 text-white",
      },
      {
        status: "active",
        filled: false,
        inverted: false,
        class: "bg-success-50 border-2 border-success-500 text-success-700",
      },
      // Light mode - inactive
      {
        status: "inactive",
        filled: true,
        inverted: false,
        class: "bg-surface-elevated text-text-primary",
      },
      {
        status: "inactive",
        filled: false,
        inverted: false,
        class: "bg-muted border-2 border-border text-text-disabled",
      },
      // Light mode - pending
      {
        status: "pending",
        filled: true,
        inverted: false,
        class: "bg-warning-500 text-white",
      },
      {
        status: "pending",
        filled: false,
        inverted: false,
        class: "bg-warning-50 border-2 border-warning-400 text-warning-700",
      },
      // Dark mode - success
      {
        status: "success",
        filled: true,
        inverted: true,
        class: "bg-success-500 text-white",
      },
      {
        status: "success",
        filled: false,
        inverted: true,
        class: "bg-success-900 border-2 border-success-400 text-success-300",
      },
      // Dark mode - error
      {
        status: "error",
        filled: true,
        inverted: true,
        class: "bg-error-500 text-white",
      },
      {
        status: "error",
        filled: false,
        inverted: true,
        class: "bg-error-900 border-2 border-error-400 text-error-300",
      },
      // Dark mode - warning
      {
        status: "warning",
        filled: true,
        inverted: true,
        class: "bg-warning-500 text-black",
      },
      {
        status: "warning",
        filled: false,
        inverted: true,
        class: "bg-warning-900 border-2 border-warning-400 text-warning-300",
      },
      // Dark mode - info
      {
        status: "info",
        filled: true,
        inverted: true,
        class: "bg-info-500 text-white",
      },
      {
        status: "info",
        filled: false,
        inverted: true,
        class: "bg-info-900 border-2 border-info-400 text-info-300",
      },
      // Dark mode - neutral
      {
        status: "neutral",
        filled: true,
        inverted: true,
        class: "bg-muted text-text-primary",
      },
      {
        status: "neutral",
        filled: false,
        inverted: true,
        class: "bg-surface-elevated border-2 border-border text-text-secondary",
      },
      // Dark mode - active
      {
        status: "active",
        filled: true,
        inverted: true,
        class: "bg-success-500 text-white",
      },
      {
        status: "active",
        filled: false,
        inverted: true,
        class: "bg-success-900 border-2 border-success-400 text-success-300",
      },
      // Dark mode - inactive
      {
        status: "inactive",
        filled: true,
        inverted: true,
        class: "bg-surface-elevated text-text-primary",
      },
      {
        status: "inactive",
        filled: false,
        inverted: true,
        class: "bg-surface-elevated border-2 border-border text-text-muted",
      },
      // Dark mode - pending
      {
        status: "pending",
        filled: true,
        inverted: true,
        class: "bg-warning-500 text-black",
      },
      {
        status: "pending",
        filled: false,
        inverted: true,
        class: "bg-warning-900 border-2 border-warning-400 text-warning-300",
      },
    ],
    defaultVariants: {
      status: "neutral",
      size: "md",
      filled: false,
      inverted: false,
    },
  }
);
