import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const seatingChartVariants = cva("flex flex-col gap-gap-lg", {
  variants: {
    zoom: {
      small: "",
      medium: "",
      large: "",
    },
    showStage: {
      true: "",
      false: "",
    },
    showLegend: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    zoom: "medium",
    showStage: true,
    showLegend: true,
  },
});

export type SeatingChartVariants = VariantProps<typeof seatingChartVariants>;
