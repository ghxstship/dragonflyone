"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { notificationProviderVariants } from "./NotificationProvider.variants.js";
import type { NotificationProviderProps, NotificationContextType } from "./NotificationProvider.types.js";
import { NotificationToast } from '../../molecules/NotificationToast/index.js';
import type { Toast } from '../../molecules/NotificationToast/NotificationToast.types.js';

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
        className={notificationProviderVariants({ position })}
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
