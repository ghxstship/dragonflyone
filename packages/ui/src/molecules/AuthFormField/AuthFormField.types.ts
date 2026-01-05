import type { ReactNode, InputHTMLAttributes } from "react";

/**
 * AuthInput component props
 */
export interface AuthInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Left icon */
  icon?: ReactNode;
  
  /** Right icon/action */
  rightElement?: ReactNode;
  
  /** Error state */
  error?: boolean;
  
  /** Size variant */
  size?: AuthInputSize;
  
  /** Inverted theme */
  inverted?: boolean;
}

/**
 * AuthInput size types
 */
export type AuthInputSize = 
  | "sm"
  | "md"
  | "lg";

/**
 * AuthPasswordInput component props
 */
export interface AuthPasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Left icon */
  icon?: ReactNode;
  
  /** Size variant */
  size?: AuthInputSize;
  
  /** Inverted theme */
  inverted?: boolean;
}

/**
 * AuthFormField component props
 */
export interface AuthFormFieldProps {
  /** Label text */
  label: string;
  
  /** Field name */
  name: string;
  
  /** Input type */
  type?: "text" | "email" | "password";
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Left icon */
  icon?: ReactNode;
  
  /** Error message */
  error?: string;
  
  /** Helper text */
  helper?: string;
  
  /** Required indicator */
  required?: boolean;
  
  /** Size variant */
  size?: AuthInputSize;
  
  /** Inverted theme */
  inverted?: boolean;
}
