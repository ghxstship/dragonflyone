import type { InputHTMLAttributes } from "react";

export type InputSizeVariant = "sm" | "md" | "lg";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Show error styling */
  error?: boolean;
  /** Expand to fill container width */
  fullWidth?: boolean;
  /** Size preset (visual size, not HTML size attribute) */
  inputSize?: InputSizeVariant;
  /** ID for the error message element (for aria-describedby) */
  errorId?: string;
  /** ID for the hint/description element (for aria-describedby) */
  hintId?: string;
}

export interface InputGroupProps extends InputProps {
  /** Label text for the input */
  label: string;
  /** Optional hint text displayed below the input */
  hint?: string;
  /** Error message to display and announce to screen readers */
  errorMessage?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Custom ID for the input (auto-generated if not provided) */
  id?: string;
}
