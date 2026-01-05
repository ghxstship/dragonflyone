import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const floorPlanCanvasVariants = cva("relative overflow-hidden border-2 border-border rounded-card", {
  variants: {
    showGrid: {
      true: "",
      false: "",
    },
    readonly: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    showGrid: true,
    readonly: false,
  },
});

export type FloorPlanCanvasVariants = VariantProps<typeof floorPlanCanvasVariants>;
