import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const statsDashboardVariants = cva("grid", {
  variants: {
    columns: {
      2: "grid-cols-2",
      3: "grid-cols-2 md:grid-cols-3",
      4: "grid-cols-2 md:grid-cols-4",
      5: "grid-cols-2 md:grid-cols-5",
      6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
    },
    compact: {
      true: "gap-3",
      false: "gap-4",
    },
    inverted: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    columns: 4,
    compact: false,
    inverted: false,
  },
});

export const statCardVariants = cva("border-2 flex flex-col rounded-[var(--radius-card)] transition-all duration-100 ease-[var(--ease-bounce)]", {
  variants: {
    compact: {
      true: "p-4 gap-2",
      false: "p-6 gap-3",
    },
    inverted: {
      true: "bg-surface-elevated border-border shadow-[4px_4px_0_rgba(255,255,255,0.1)]",
      false: "bg-white border-black shadow-[4px_4px_0_rgba(0,0,0,0.1)]",
    },
    clickable: {
      true: "cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5",
      false: "",
    },
  },
  defaultVariants: {
    compact: false,
    inverted: false,
    clickable: false,
  },
});

export type StatsDashboardVariants = VariantProps<typeof statsDashboardVariants>;
export type StatCardVariants = VariantProps<typeof statCardVariants>;
