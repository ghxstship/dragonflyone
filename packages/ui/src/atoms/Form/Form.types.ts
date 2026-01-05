import type { FormHTMLAttributes } from "react";

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  /** Gap between form elements */
  gap?: 2 | 4 | 6 | 8;
  /** Full width form */
  fullWidth?: boolean;
}

export interface FormVariants {
  /** Gap between form elements */
  gap?: 2 | 4 | 6 | 8;
  /** Full width form */
  fullWidth?: boolean;
  /** Additional CSS classes */
  className?: string;
}
