import type { HTMLAttributes } from "react";

export interface SparklineProps extends HTMLAttributes<SVGSVGElement> {
  /** Array of numeric data points */
  data: number[];
  /** Width of the sparkline */
  width?: number;
  /** Height of the sparkline */
  height?: number;
  /** Stroke width of the line */
  strokeWidth?: number;
  /** Color variant */
  variant?: "default" | "success" | "error" | "warning" | "info";
  /** Show area fill under the line */
  showArea?: boolean;
  /** Show dots at data points */
  showDots?: boolean;
  /** Animate on mount */
  animate?: boolean;
  /** Inverted colors for dark backgrounds */
  inverted?: boolean;
}

export interface SparklineVariants {
  variant?: "default" | "success" | "error" | "warning" | "info";
  showArea?: boolean;
  showDots?: boolean;
  animate?: boolean;
  inverted?: boolean;
  className?: string;
}
