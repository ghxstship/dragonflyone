import type { SelectHTMLAttributes } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Show error state styling */
  error?: boolean;
  /** Take full width of parent */
  fullWidth?: boolean;
  /** ID for the error message element (for aria-describedby) */
  errorId?: string;
  /** ID for the hint/description element (for aria-describedby) */
  hintId?: string;
}

export interface SelectGroupProps {
  /** Label text for the select group */
  label?: string;
  /** Hint/description text */
  hint?: string;
  /** Error message to display */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Child elements */
  children: React.ReactNode;
}
