import type { SVGAttributes } from "react";

export interface IconProps extends SVGAttributes<SVGElement> {
  /** Size variant */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Stroke width variant */
  strokeWidth?: "thin" | "regular" | "bold";
}

export interface IconBoxProps {
  /** Icon size */
  size?: "sm" | "md" | "lg";
  /** Background color */
  color?: string;
  /** Icon color */
  iconColor?: string;
  /** Custom className */
  className?: string;
  /** Child icon element */
  children: React.ReactNode;
}
