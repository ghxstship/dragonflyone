import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const clientPortalShellVariants = cva("min-h-screen flex flex-col", {
  variants: {
    inverted: {
      true: "bg-surface-inverse text-text-primary",
      false: "bg-muted text-text-primary",
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
  },
  defaultVariants: {
    inverted: true,
    loading: false,
    error: false,
    offline: false,
    restricted: false,
  },
});

export type ClientPortalShellVariants = VariantProps<typeof clientPortalShellVariants>;
