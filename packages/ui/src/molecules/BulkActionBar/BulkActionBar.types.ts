import type { ReactNode } from "react";

/**
 * Bulk action definition
 */
export interface BulkAction {
  /** Unique action identifier */
  id: string;
  
  /** Display label */
  label: string;
  
  /** Icon (emoji or component) */
  icon?: ReactNode;
  
  /** Action variant for styling */
  variant?: BulkActionVariant;
  
  /** Whether action is disabled */
  disabled?: boolean;
  
  /** Requires confirmation before executing */
  requiresConfirmation?: boolean;
  
  /** Confirmation message */
  confirmationMessage?: string;
}

/**
 * Bulk action variant types
 */
export type BulkActionVariant = 
  | "default"
  | "danger"
  | "primary";

/**
 * BulkActionBar component props
 */
export interface BulkActionBarProps {
  /** Number of selected items */
  selectedCount: number;
  
  /** Available bulk actions */
  actions: BulkAction[];
  
  /** Action click handler */
  onAction: (actionId: string) => void;
  
  /** Clear selection handler */
  onClearSelection: () => void;
  
  /** Entity name for display (e.g., "items", "records") */
  entityName?: string;
  
  /** Whether any action is currently loading */
  loading?: boolean;
  
  /** Currently loading action ID */
  loadingActionId?: string;
  
  /** Position of the bar */
  position?: BulkActionBarPosition;
  
  /** Inverted theme */
  inverted?: boolean;
  
  /** Custom className */
  className?: string;
}

/**
 * BulkActionBar position options
 */
export type BulkActionBarPosition = 
  | "top"
  | "bottom" 
  | "floating";
