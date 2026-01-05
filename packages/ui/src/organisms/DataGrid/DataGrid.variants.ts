import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const dataGridVariants = cva("w-full border-2 border-border rounded-[var(--radius-card)] overflow-hidden", {
  variants: {
    density: {
      compact: "text-xs",
      default: "text-sm",
      relaxed: "text-base",
    },
    striped: {
      true: "",
      false: "",
    },
    loading: {
      true: "",
      false: "",
    },
    inverted: {
      true: "bg-surface-inverse text-text-primary",
      false: "bg-surface-primary text-text-primary",
    },
  },
  defaultVariants: {
    density: "default",
    striped: false,
    loading: false,
    inverted: false,
  },
});

export type DataGridVariants = VariantProps<typeof dataGridVariants>;
