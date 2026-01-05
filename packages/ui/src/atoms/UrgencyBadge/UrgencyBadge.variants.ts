import { cva } from "class-variance-authority";

export const urgencyBadgeVariants = cva(
  // Base styles
  "inline-flex items-center font-code uppercase tracking-widest leading-none font-bold rounded-[var(--radius-badge)] border-2",
  {
    variants: {
      type: {
        "low-stock": "",
        "selling-fast": "",
        "last-chance": "",
        "limited": "",
        "ending-soon": "",
        "new": "",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-3 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
      animated: {
        true: "animate-pulse",
        false: "",
      },
      inverted: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      // Low stock variants
      {
        type: "low-stock",
        inverted: false,
        class: "bg-warning-50 border-warning-500 text-warning-700",
      },
      {
        type: "low-stock",
        inverted: true,
        class: "bg-warning-900 border-warning-400 text-warning-300",
      },
      // Selling fast variants
      {
        type: "selling-fast",
        inverted: false,
        class: "bg-error-50 border-error-500 text-error-700",
      },
      {
        type: "selling-fast",
        inverted: true,
        class: "bg-error-900 border-error-400 text-error-300",
      },
      // Last chance variants
      {
        type: "last-chance",
        inverted: false,
        class: "bg-error-50 border-error-500 text-error-700",
      },
      {
        type: "last-chance",
        inverted: true,
        class: "bg-error-900 border-error-400 text-error-300",
      },
      // Limited variants
      {
        type: "limited",
        inverted: false,
        class: "bg-info-50 border-info-500 text-info-700",
      },
      {
        type: "limited",
        inverted: true,
        class: "bg-info-900 border-info-400 text-info-300",
      },
      // Ending soon variants
      {
        type: "ending-soon",
        inverted: false,
        class: "bg-warning-50 border-warning-500 text-warning-700",
      },
      {
        type: "ending-soon",
        inverted: true,
        class: "bg-warning-900 border-warning-400 text-warning-300",
      },
      // New variants
      {
        type: "new",
        inverted: false,
        class: "bg-success-50 border-success-500 text-success-700",
      },
      {
        type: "new",
        inverted: true,
        class: "bg-success-900 border-success-400 text-success-300",
      },
    ],
    defaultVariants: {
      type: "limited",
      size: "md",
      animated: false,
      inverted: false,
    },
  }
);
