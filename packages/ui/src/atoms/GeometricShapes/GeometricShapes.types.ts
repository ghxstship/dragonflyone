import type { HTMLAttributes } from "react";

export interface GeometricShapeProps extends HTMLAttributes<HTMLDivElement> {
  /** Shape type */
  shape?: "square" | "circle" | "triangle" | "diamond" | "hexagon" | "cross" | "arrow";
  /** Size in pixels or Tailwind size class */
  size?: number | "sm" | "md" | "lg" | "xl";
  /** Fill color */
  fill?: "black" | "white" | "transparent" | "grey";
  /** Border/stroke */
  stroke?: boolean;
  /** Stroke width */
  strokeWidth?: number;
  /** Rotation in degrees */
  rotate?: number;
  /** Animation */
  animate?: "spin" | "pulse" | "bounce" | "none";
}

export interface GeometricPatternProps extends HTMLAttributes<HTMLDivElement> {
  /** Pattern type */
  pattern?: "dots" | "grid" | "diagonal" | "chevron" | "zigzag";
  /** Pattern size */
  size?: "sm" | "md" | "lg";
  /** Pattern color */
  color?: "black" | "white" | "grey";
  /** Pattern opacity */
  opacity?: number;
}

export interface GeometricShapeVariants {
  /** Shape type */
  shape?: "square" | "circle" | "triangle" | "diamond" | "hexagon" | "cross" | "arrow";
  /** Size */
  size?: number | "sm" | "md" | "lg" | "xl";
  /** Fill color */
  fill?: "black" | "white" | "transparent" | "grey";
  /** Stroke */
  stroke?: boolean;
  /** Stroke width */
  strokeWidth?: number;
  /** Rotation */
  rotate?: number;
  /** Animation */
  animate?: "spin" | "pulse" | "bounce" | "none";
  /** Additional CSS classes */
  className?: string;
}

export interface GeometricPatternVariants {
  /** Pattern type */
  pattern?: "dots" | "grid" | "diagonal" | "chevron" | "zigzag";
  /** Pattern size */
  size?: "sm" | "md" | "lg";
  /** Pattern color */
  color?: "black" | "white" | "grey";
  /** Pattern opacity */
  opacity?: number;
  /** Additional CSS classes */
  className?: string;
}
