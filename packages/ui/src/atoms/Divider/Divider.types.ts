import type { HTMLAttributes } from "react";

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  /** Divider orientation */
  orientation?: "horizontal" | "vertical";
  /** Border weight */
  weight?: "thin" | "medium" | "thick";
  /** Inverted colors */
  inverted?: boolean;
}

export interface DividerVariants {
  /** Divider orientation */
  orientation?: "horizontal" | "vertical";
  /** Border weight */
  weight?: "thin" | "medium" | "thick";
  /** Inverted colors */
  inverted?: boolean;
  /** Additional CSS classes */
  className?: string;
}
