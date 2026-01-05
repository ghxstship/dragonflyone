import type { InputHTMLAttributes } from "react";

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: boolean;
  fullWidth?: boolean;
  inverted?: boolean;
}

export interface PasswordInputVariants {
  error?: boolean;
  fullWidth?: boolean;
  inverted?: boolean;
  className?: string;
}
