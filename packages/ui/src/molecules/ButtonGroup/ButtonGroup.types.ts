import type { HTMLAttributes } from "react";

/**
 * ButtonGroup component props
 */
export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Group orientation */
  orientation?: ButtonGroupOrientation;
  
  /** Full width */
  fullWidth?: boolean;
  
  /** Spacing between buttons */
  spacing?: ButtonGroupSpacing;
}

/**
 * ButtonGroup orientation options
 */
export type ButtonGroupOrientation = 
  | "horizontal"
  | "vertical";

/**
 * ButtonGroup spacing options
 */
export type ButtonGroupSpacing = 
  | "none"
  | "sm"
  | "md"
  | "lg";
