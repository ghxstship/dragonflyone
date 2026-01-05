import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const authenticatedShellVariants = cva("flex h-screen overflow-hidden bg-surface-primary text-text-primary", {
  variants: {
    inverted: {
      true: "bg-surface-inverse text-text-primary",
      false: "bg-surface-primary text-text-primary",
    },
    sidebarCollapsed: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    inverted: true,
    sidebarCollapsed: false,
  },
});

export type AuthenticatedShellVariants = VariantProps<typeof authenticatedShellVariants>;
