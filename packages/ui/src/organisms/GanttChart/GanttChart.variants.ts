import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const ganttChartVariants = cva("rounded-lg border-2 overflow-hidden", {
  variants: {
    viewMode: {
      day: "",
      week: "",
      month: "",
      quarter: "",
    },
    inverted: {
      true: "bg-surface-inverse border-border",
      false: "bg-surface-primary border-border",
    },
    loading: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    viewMode: "week",
    inverted: true,
    loading: false,
  },
});

export type GanttChartVariants = VariantProps<typeof ganttChartVariants>;
