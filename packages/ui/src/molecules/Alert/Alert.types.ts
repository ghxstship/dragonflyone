import type { HTMLAttributes, ReactNode } from "react";

/**
 * Alert component props
 */
export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  /** Alert variant */
  variant?: AlertVariant;
  
  /** Alert title */
  title?: string;
  
  /** Custom icon */
  icon?: ReactNode;
  
  /** Close handler */
  onClose?: () => void;
  
  /** Inverted theme */
  inverted?: boolean;
}

/**
 * Alert variant types
 */
export type AlertVariant = 
  | "info"
  | "success" 
  | "warning"
  | "error";
