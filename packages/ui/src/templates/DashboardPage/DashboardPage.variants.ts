import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const dashboardPageVariants = cva("flex min-h-screen", {
  variants: {
    inverted: {
      true: "bg-surface-inverse text-text-primary",
      false: "bg-surface-primary text-text-primary",
    },
    loading: {
      true: "",
      false: "",
    },
    error: {
      true: "",
      false: "",
    },
    offline: {
      true: "",
      false: "",
    },
    restricted: {
      true: "",
      false: "",
    },
    empty: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    inverted: true,
    loading: false,
    error: false,
    offline: false,
    restricted: false,
    empty: false,
  },
});

export type DashboardPageVariants = VariantProps<typeof dashboardPageVariants>;
