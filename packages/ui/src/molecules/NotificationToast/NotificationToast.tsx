"use client";

import React, { useEffect, useState, useCallback } from "react";
import { X, Check, AlertTriangle, Info, Undo2 } from "lucide-react";
import { 
  notificationToastVariants,
  notificationToastIconVariants,
  notificationToastContentVariants,
  notificationToastTitleVariants,
  notificationToastMessageVariants,
  notificationToastCloseVariants,
  notificationToastProgressVariants,
  notificationToastUndoVariants 
} from "./NotificationToast.variants.js";
import type { NotificationToastProps, NotificationToastType } from "./NotificationToast.types.js";

/**
 * NotificationToast component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Slide and bounce animation on appear
 * - Bold 2px borders
 * - Hard offset shadow
 * - Bold close button with hover lift
 * - Progress bar for auto-dismiss
 * - Undo action support
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <NotificationToast
 *   id="toast-1"
 *   type="success"
 *   title="Success!"
 *   message="Your changes have been saved."
 *   onDismiss={(id) => console.log('Dismissed:', id)}
 * />
 * ```
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

  // Icon mapping for toast types
  const getIcon = (toastType: NotificationToastType) => {
    switch (toastType) {
      case "success":
        return <Check className="w-5 h-5" />;
      case "error":
        return <X className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "info":
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  // Handle undo action
  const handleUndo = useCallback(() => {
    undoAction?.onClick();
    onDismiss(id);
  }, [undoAction, onDismiss, id]);

  // Auto-dismiss timer
  useEffect(() => {
    if (duration <= 0) return;

    const interval = 100;
    const totalSteps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      if (!isPaused) {
        currentStep++;
        const newProgress = Math.max(0, 100 - (currentStep / totalSteps) * 100);
        setProgress(newProgress);

        if (currentStep >= totalSteps) {
          clearInterval(timer);
          onDismiss(id);
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, [duration, isPaused, onDismiss, id]);

  // Pause progress on hover
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <div
      className={notificationToastVariants({ type })}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className={notificationToastIconVariants({ type })}>
        {getIcon(type)}
      </div>

      {/* Content */}
      <div className={notificationToastContentVariants({ type })}>
        <h4 className={notificationToastTitleVariants({ type })}>
          {title}
        </h4>
        {message && (
          <p className={notificationToastMessageVariants({ type })}>
            {message}
          </p>
        )}

        {/* Undo Action */}
        {undoAction && (
          <button
            onClick={handleUndo}
            className={notificationToastUndoVariants({ type })}
          >
            <Undo2 className="w-3 h-3" />
            {undoAction.label}
          </button>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={() => onDismiss(id)}
        className={notificationToastCloseVariants({ type })}
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Bar */}
      {showProgress && duration > 0 && (
        <div
          className={notificationToastProgressVariants({ type })}
          style={{ width: `${progress}%` }}
        />
      )}
    </div>
  );
}
