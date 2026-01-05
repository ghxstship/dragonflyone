import type { ReactNode, HTMLAttributes } from "react";

/**
 * AIChatEmptyState component props
 */
export interface AIChatEmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /** Icon or illustration element */
  icon?: ReactNode;
  
  /** Title text */
  title: string;
  
  /** Description text */
  description?: string;
  
  /** Suggestion prompts or actions */
  suggestions?: ReactNode;
  
  /** Inverted theme */
  inverted?: boolean;
}
