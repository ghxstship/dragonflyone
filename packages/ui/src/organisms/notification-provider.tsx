'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { NotificationToast, Toast } from '../molecules/notification-toast.js';

interface NotificationContextType {
  addNotification: (toast: Omit<Toast, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  // Return a no-op implementation if context is not available (e.g., during SSR/SSG)
  if (!context) {
    return {
      addNotification: () => {},
      removeNotification: () => {},
    };
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
  /** Maximum number of toasts to display at once (default: 5) */
  maxToasts?: number;
  /** Position of toast container */
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
}

const POSITION_CLASSES = {
  "top-right": "top-0 right-0",
  "top-left": "top-0 left-0",
  "bottom-right": "bottom-0 right-0",
  "bottom-left": "bottom-0 left-0",
  "top-center": "top-0 left-1/2 -translate-x-1/2",
  "bottom-center": "bottom-0 left-1/2 -translate-x-1/2",
};

export function NotificationProvider({ 
  children, 
  maxToasts = 5,
  position = "bottom-right",
}: NotificationProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addNotification = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => {
      const newToasts = [...prev, { ...toast, id }];
      // Limit to maxToasts, removing oldest first
      if (newToasts.length > maxToasts) {
        return newToasts.slice(-maxToasts);
      }
      return newToasts;
    });
  }, [maxToasts]);

  const removeNotification = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo<NotificationContextType>(() => ({
    addNotification,
    removeNotification,
  }), [addNotification, removeNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Toast Container */}
      <div
        className={`pointer-events-none fixed z-modal flex flex-col gap-gap-md p-spacing-6 ${POSITION_CLASSES[position]}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <NotificationToast
            key={toast.id}
            {...toast}
            onDismiss={removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
