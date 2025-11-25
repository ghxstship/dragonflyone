'use client';

import React, { useEffect } from 'react';
import { X } from '../atoms/icon.js';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationToastProps extends Toast {
  onDismiss: (id: string) => void;
}

export function NotificationToast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onDismiss,
}: NotificationToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  const colors = {
    success: 'border-green-500 bg-green-950',
    error: 'border-red-500 bg-red-950',
    info: 'border-blue-500 bg-blue-950',
    warning: 'border-yellow-500 bg-yellow-950',
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  return (
    <div
      className={`pointer-events-auto flex w-full max-w-sm border-2 ${colors[type]} p-4`}
      role="alert"
    >
      <div className="flex-1">
        <div className="flex items-start gap-3">
          <span className="text-xl">{icons[type]}</span>
          <div className="flex-1">
            <p className="font-display text-sm text-white">{title}</p>
            {message && (
              <p className="mt-1 text-xs text-ink-300">{message}</p>
            )}
          </div>
          <button
            onClick={() => onDismiss(id)}
            className="text-ink-500 transition-colors hover:text-white"
            aria-label="Dismiss notification"
          >
            <X size="sm" />
          </button>
        </div>
      </div>
    </div>
  );
}
