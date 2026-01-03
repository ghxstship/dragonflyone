'use client';

import React, { useEffect, useState, useCallback } from 'react';
import clsx from 'clsx';
import { X, Check, AlertTriangle, Info, Undo2 } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  /** Show progress bar for auto-dismiss countdown */
  showProgress?: boolean;
  /** Undo action configuration */
  undoAction?: {
    label: string;
    onClick: () => void;
  };
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
  showProgress = true,
  undoAction,
  onDismiss,
}: NotificationToastProps) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  const handleUndo = useCallback(() => {
    undoAction?.onClick();
    onDismiss(id);
  }, [undoAction, onDismiss, id]);

  useEffect(() => {
    if (duration <= 0 || isPaused) return;

    const startTime = Date.now();
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining <= 0) {
        clearInterval(intervalId);
        onDismiss(id);
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, [id, duration, onDismiss, isPaused]);

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

  const getProgressBarColor = () => {
    switch (type) {
      case 'success': return 'bg-success-400';
      case 'error': return 'bg-error-400';
      case 'info': return 'bg-info-400';
      case 'warning': return 'bg-warning-400';
      default: return 'bg-white';
    }
  };

  return (
    <div
      className={clsx(
        "pointer-events-auto flex flex-col w-full max-w-sm overflow-hidden",
        "border-2 rounded-[var(--radius-card)]",
        "animate-slide-up-bounce",
        getColorClasses()
      )}
      role="alert"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex-1 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl font-bold">{icons[type]}</span>
          <div className="flex-1 min-w-0">
            <p className="font-heading text-sm uppercase tracking-wider font-bold text-white">{title}</p>
            {message && (
              <p className="mt-1 text-sm text-white/80">{message}</p>
            )}
            {undoAction && (
              <button
                onClick={handleUndo}
                className={clsx(
                  "mt-2 inline-flex items-center gap-1 text-xs font-medium",
                  "px-2 py-1 rounded border border-white/30",
                  "hover:bg-white/10 hover:border-white/50 transition-colors",
                  "text-white/80 hover:text-white"
                )}
              >
                <Undo2 className="size-3" />
                {undoAction.label}
              </button>
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
      {/* Progress bar */}
      {showProgress && duration > 0 && (
        <div className="h-1 bg-surface-overlay">
          <div
            className={clsx("h-full transition-all duration-100", getProgressBarColor())}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
