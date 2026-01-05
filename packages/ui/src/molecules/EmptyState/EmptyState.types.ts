import type { ReactNode } from "react";

/**
 * EmptyState component props
 */
export interface EmptyStateProps {
  /** Custom icon */
  icon?: ReactNode;
  
  /** Title text */
  title: string;
  
  /** Description text */
  description?: string;
  
  /** Primary action button */
  action?: EmptyStateAction;
  
  /** Secondary action button */
  secondaryAction?: EmptyStateAction;
  
  /** Contextual suggestions */
  suggestions?: string[];
  
  /** Inverted theme */
  inverted?: boolean;
  
  /** Custom className */
  className?: string;
}

/**
 * EmptyState action button props
 */
export interface EmptyStateAction {
  /** Button label */
  label: string;
  
  /** Click handler */
  onClick: () => void;
  
  /** Button variant */
  variant?: "primary" | "secondary";
}
