import type { HTMLAttributes } from "react";

export type BadgeVariant = 
  | "solid" 
  | "outline" 
  | "ghost" 
  | "success" 
  | "warning" 
  | "error" 
  | "info" 
  | "pop"
  | "destructive"
  | "secondary";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual style variant */
  variant?: BadgeVariant;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Custom background color (hex or CSS color) - use for dynamic colors from data */
  color?: string;
  /** Custom text color (hex or CSS color) - defaults to white when color is set */
  textColor?: string;
}
