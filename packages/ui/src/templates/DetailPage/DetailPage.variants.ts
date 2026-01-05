import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const detailPageVariants = cva("min-h-screen", {
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
    notFound: {
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
    sidebarPosition: {
      left: "",
      right: "",
    },
    sidebarWidth: {
      3: "",
      4: "",
      5: "",
    },
  },
  defaultVariants: {
    inverted: true,
    loading: false,
    error: false,
    notFound: false,
    offline: false,
    restricted: false,
    sidebarPosition: "right",
    sidebarWidth: 4,
  },
});

export type DetailPageVariants = VariantProps<typeof detailPageVariants>;
