import type { ReactNode } from 'react';
import type { Toast } from '../../molecules/NotificationToast/NotificationToast.types.js';

interface NotificationContextType {
  addNotification: (toast: Omit<Toast, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export interface NotificationProviderProps {
  children: ReactNode;
  /** Maximum number of toasts to display at once (default: 5) */
  maxToasts?: number;
  /** Position of toast container */
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
}

export type { NotificationContextType };
