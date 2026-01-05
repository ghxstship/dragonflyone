import type { ReactNode } from "react";

/**
 * ConfirmDialog component props
 */
export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  
  /** Dialog title */
  title: string;
  
  /** Dialog message/description */
  message: string;
  
  /** Confirm button label */
  confirmLabel?: string;
  
  /** Cancel button label */
  cancelLabel?: string;
  
  /** Visual variant for the dialog */
  variant?: ConfirmDialogVariant;
  
  /** Loading state for confirm action */
  loading?: boolean;
  
  /** Confirm action handler */
  onConfirm: () => void;
  
  /** Cancel action handler - also serves as onClose */
  onCancel: () => void;
  
  /** Alias for onCancel for API consistency */
  onClose?: () => void;
  
  /** Additional details or warning text */
  details?: string;
  
  /** Inverted theme (dark background) */
  inverted?: boolean;
  
  /** Custom className */
  className?: string;
}

/**
 * ConfirmDialog variant types
 */
export type ConfirmDialogVariant = 
  | "danger"
  | "warning" 
  | "info";

/**
 * ConfirmDialog icon mapping
 */
export interface ConfirmDialogIcons {
  danger: ReactNode;
  warning: ReactNode;
  info: ReactNode;
}
