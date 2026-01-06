import { cva } from "class-variance-authority";

export const tableHeaderVariants = cva(
  "bg-[var(--color-surface-elevated)]",
  {
    variants: {
      sticky: {
        true: "sticky top-0 z-10",
        false: "",
      },
    },
    defaultVariants: {
      sticky: true,
    },
  }
);

export const tableHeaderCellVariants = cva(
  "px-4 py-3 text-left text-xs font-medium text-[var(--color-text-primary)] uppercase tracking-wider border-b border-[var(--color-border-input)]",
  {
    variants: {
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
      sortable: {
        true: "cursor-pointer hover:bg-[var(--color-surface-elevated)]",
        false: "",
      },
    },
    defaultVariants: {
      align: "left",
      sortable: false,
    },
  }
);
