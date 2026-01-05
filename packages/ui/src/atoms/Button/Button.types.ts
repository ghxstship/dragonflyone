import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = 
  | "solid" 
  | "outline" 
  | "ghost" 
  | "primary" 
  | "accent" 
  | "destructive";

export type ButtonSize = "sm" | "md" | "lg" | "xl" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Icon element to display */
  icon?: ReactNode;
  /** Position of icon relative to text */
  iconPosition?: "left" | "right";
  /** Expand to fill container width */
  fullWidth?: boolean;
  /** Adapt colors for dark backgrounds (true) or light backgrounds (false) */
  inverted?: boolean;
  /** Show loading spinner and disable interactions */
  isLoading?: boolean;
  /** Text to display while loading (defaults to children) */
  loadingText?: string;
}
