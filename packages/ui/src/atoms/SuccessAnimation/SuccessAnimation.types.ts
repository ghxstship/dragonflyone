import type { HTMLAttributes } from "react";

export interface SuccessAnimationProps extends HTMLAttributes<HTMLDivElement> {
  /** Show the success animation */
  show: boolean;
  /** Size of the animation */
  size?: "sm" | "md" | "lg";
  /** Auto-hide after duration (ms), 0 to disable */
  autoHideDuration?: number;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Inverted colors for dark backgrounds */
  inverted?: boolean;
}

export interface SuccessAnimationVariants {
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
  className?: string;
}
