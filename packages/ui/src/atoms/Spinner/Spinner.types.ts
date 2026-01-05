import type { HTMLAttributes } from "react";

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /** Size variant */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Color variant */
  variant?: "black" | "white" | "grey";
  /** Optional loading text displayed below the spinner */
  text?: string;
}
