import type { HTMLAttributes, ReactNode } from "react";

/**
 * Field component props
 */
export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  /** Field label */
  label?: string;
  
  /** Error message */
  error?: string;
  
  /** Hint text */
  hint?: string;
  
  /** Required field indicator */
  required?: boolean;
  
  /** Inverted theme */
  inverted?: boolean;
  
  /** Field content */
  children: ReactNode;
}
