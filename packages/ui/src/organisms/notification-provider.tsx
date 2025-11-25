'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
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
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addNotification = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      
      {/* Toast Container */}
      <div
        className="pointer-events-none fixed bottom-0 right-0 z-50 flex flex-col gap-4 p-6"
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
