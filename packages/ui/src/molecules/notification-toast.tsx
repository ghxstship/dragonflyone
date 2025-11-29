'use client';

import React, { useEffect } from 'react';
import clsx from 'clsx';
import { X, Check, AlertTriangle, Info } from 'lucide-react';

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

/**
 * NotificationToast component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Slide + bounce animation on appear
 * - Bold 2px borders
 * - Hard offset shadow
 * - Bold close button with hover lift
 */
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

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'border-success-500 bg-success-900 shadow-[4px_4px_0_rgba(34,197,94,0.3)]';
      case 'error':
        return 'border-error-500 bg-error-900 shadow-[4px_4px_0_rgba(239,68,68,0.3)]';
      case 'info':
        return 'border-info-500 bg-info-900 shadow-[4px_4px_0_rgba(59,130,246,0.3)]';
      case 'warning':
        return 'border-warning-500 bg-warning-900 shadow-[4px_4px_0_rgba(245,158,11,0.3)]';
      default:
        return '';
    }
  };

  const icons = {
    success: <Check className="size-5" />,
    error: <X className="size-5" />,
    info: <Info className="size-5" />,
    warning: <AlertTriangle className="size-5" />,
  };

  return (
    <div
      className={clsx(
        "pointer-events-auto flex w-full max-w-sm",
        "border-2 rounded-[var(--radius-card)] p-4",
        "animate-slide-up-bounce",
        getColorClasses()
      )}
      role="alert"
    >
      <div className="flex-1">
        <div className="flex items-start gap-3">
          <span className="text-xl font-bold">{icons[type]}</span>
          <div className="flex-1 min-w-0">
            <p className="font-heading text-sm uppercase tracking-wider font-bold text-white">{title}</p>
            {message && (
              <p className="mt-1 text-sm text-white/80">{message}</p>
            )}
          </div>
          <button
            onClick={() => onDismiss(id)}
            className={clsx(
              "p-1 border-2 border-white/30 rounded",
              "transition-all duration-100",
              "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-white hover:shadow-[2px_2px_0_rgba(255,255,255,0.2)]",
              "active:translate-x-0 active:translate-y-0",
              "text-white/60 hover:text-white"
            )}
            aria-label="Dismiss notification"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
