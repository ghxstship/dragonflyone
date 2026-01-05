import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const dashboardBuilderVariants = cva("relative", {
  variants: {
    editMode: {
      true: "",
      false: "",
    },
    inverted: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    editMode: true,
    inverted: true,
  },
});

export const widgetVariants = cva("relative rounded-lg border-2 overflow-hidden transition-all", {
  variants: {
    size: {
      small: "col-span-1 row-span-1",
      medium: "col-span-2 row-span-1",
      large: "col-span-2 row-span-2",
      full: "col-span-4 row-span-1",
    },
    inverted: {
      true: "bg-surface-elevated border-border",
      false: "bg-surface-primary border-border",
    },
    editMode: {
      true: "hover:border-primary-500",
      false: "",
    },
    dragging: {
      true: "opacity-50 z-popover",
      false: "",
    },
  },
  defaultVariants: {
    size: "medium",
    inverted: true,
    editMode: true,
    dragging: false,
  },
});

export const widgetPaletteVariants = cva("fixed inset-y-0 right-0 w-80 z-sidebar-backdrop border-l-2 shadow-xl overflow-y-auto", {
  variants: {
    inverted: {
      true: "bg-surface-inverse border-border",
      false: "bg-surface-primary border-border",
    },
  },
  defaultVariants: {
    inverted: true,
  },
});

export type DashboardBuilderVariants = VariantProps<typeof dashboardBuilderVariants>;
export type WidgetVariants = VariantProps<typeof widgetVariants>;
export type WidgetPaletteVariants = VariantProps<typeof widgetPaletteVariants>;
