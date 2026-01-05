import type { ReactNode, HTMLAttributes } from "react";

/**
 * AIChatInput component props
 */
export interface AIChatInputProps extends Omit<HTMLAttributes<HTMLFormElement>, "onSubmit" | "onChange"> {
  /** Current input value */
  value: string;
  
  /** Value change handler */
  onChange: (value: string) => void;
  
  /** Submit handler */
  onSubmit: (value: string) => void;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Whether input is disabled */
  disabled?: boolean;
  
  /** Whether AI is currently responding */
  isLoading?: boolean;
  
  /** Maximum character count */
  maxLength?: number;
  
  /** Show character count */
  showCharCount?: boolean;
  
  /** Left side actions (attachments, etc.) */
  leftActions?: ReactNode;
  
  /** Right side actions (send button, etc.) */
  rightActions?: ReactNode;
  
  /** Suggestion chips below input */
  suggestions?: ReactNode;
  
  /** Inverted theme */
  inverted?: boolean;
}
