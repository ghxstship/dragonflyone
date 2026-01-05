import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const canvasLayoutVariants = cva("h-screen flex flex-col overflow-hidden", {
  variants: {
    inverted: {
      true: "bg-surface-inverse text-text-primary",
      false: "bg-surface-primary text-text-primary",
    },
    toolbar: {
      none: "",
      top: "",
      floating: "",
    },
    leftPanel: {
      none: "",
      fixed: "",
      collapsible: "",
      floating: "",
    },
    rightPanel: {
      none: "",
      fixed: "",
      collapsible: "",
      floating: "",
    },
    bottomPanel: {
      none: "",
      fixed: "",
      collapsible: "",
    },
    panelWidth: {
      narrow: "",
      medium: "",
      wide: "",
    },
    canvas: {
      constrained: "",
      infinite: "",
    },
    canvasControls: {
      none: "",
      zoom: "",
      pan: "",
      both: "",
    },
    grid: {
      none: "",
      dots: "",
      lines: "",
    },
    loading: {
      true: "",
      false: "",
    },
    error: {
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
    toolbar: "none",
    leftPanel: "none",
    rightPanel: "none",
    bottomPanel: "none",
    panelWidth: "medium",
    canvas: "infinite",
    canvasControls: "both",
    grid: "dots",
    loading: false,
    error: false,
    empty: false,
  },
});

export type CanvasLayoutVariants = VariantProps<typeof canvasLayoutVariants>;
