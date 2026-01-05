import type { TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Show error state styling */
  error?: boolean;
  /** Take full width of parent */
  fullWidth?: boolean;
  /** ID for the error message element (for aria-describedby) */
  errorId?: string;
  /** ID for the hint/description element (for aria-describedby) */
  hintId?: string;
}

export interface TextareaGroupProps extends Omit<TextareaProps, 'id'> {
  /** Label text for the textarea */
  label: string;
  /** Optional hint text displayed below the textarea */
  hint?: string;
  /** Error message to display and announce to screen readers */
  errorMessage?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Custom ID for the textarea (auto-generated if not provided) */
  id?: string;
}
