import type { HTMLAttributes } from "react";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Current progress value */
  value: number;
  /** Maximum value */
  max?: number;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Visual style variant */
  variant?: "default" | "inverse" | "success" | "warning" | "error" | "info" | "pop";
  /** Show percentage label */
  showLabel?: boolean;
}
