/**
 * Toast notification interface
 */
export interface Toast {
  id: string;
  type: NotificationToastType;
  title: string;
  message?: string;
  duration?: number;
  showProgress?: boolean;
  undoAction?: NotificationToastUndoAction;
}

/**
 * NotificationToast type options
 */
export type NotificationToastType = 
  | "success"
  | "error"
  | "info"
  | "warning";

/**
 * NotificationToast undo action
 */
export interface NotificationToastUndoAction {
  label: string;
  onClick: () => void;
}

/**
 * NotificationToast component props
 */
export interface NotificationToastProps extends Toast {
  onDismiss: (id: string) => void;
}
