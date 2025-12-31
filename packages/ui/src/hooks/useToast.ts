"use client";

import { useCallback } from "react";
import { useNotifications } from "../organisms/notification-provider.js";
import type { Toast } from "../molecules/notification-toast.js";

/**
 * Toast options for convenience methods
 */
export interface ToastOptions {
  /** Toast message body */
  message?: string;
  /** Auto-dismiss duration in ms (default: 5000, 0 = no auto-dismiss) */
  duration?: number;
  /** Show countdown progress bar */
  showProgress?: boolean;
  /** Undo action configuration */
  undoAction?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * useToast - Convenience wrapper around useNotifications
 * 
 * Provides shorthand methods for common toast types:
 * - toast.success(title, options?)
 * - toast.error(title, options?)
 * - toast.info(title, options?)
 * - toast.warning(title, options?)
 * 
 * @example
 * ```tsx
 * const toast = useToast();
 * 
 * // Simple usage
 * toast.success("Saved");
 * toast.error("Failed to save");
 * 
 * // With message
 * toast.success("Project Created", { message: "Your project is ready" });
 * 
 * // With undo action
 * toast.success("Item Deleted", {
 *   message: "The item has been removed",
 *   undoAction: { label: "Undo", onClick: handleUndo }
 * });
 * ```
 */
export function useToast() {
  const { addNotification, removeNotification } = useNotifications();

  const createToast = useCallback(
    (type: Toast["type"], title: string, options?: ToastOptions | string) => {
      // Support both string message and options object for convenience
      const opts: ToastOptions = typeof options === "string" ? { message: options } : options || {};
      
      addNotification({
        type,
        title,
        message: opts.message,
        duration: opts.duration,
        showProgress: opts.showProgress,
        undoAction: opts.undoAction,
      });
    },
    [addNotification]
  );

  const success = useCallback(
    (title: string, options?: ToastOptions | string) => createToast("success", title, options),
    [createToast]
  );

  const error = useCallback(
    (title: string, options?: ToastOptions | string) => createToast("error", title, options),
    [createToast]
  );

  const info = useCallback(
    (title: string, options?: ToastOptions | string) => createToast("info", title, options),
    [createToast]
  );

  const warning = useCallback(
    (title: string, options?: ToastOptions | string) => createToast("warning", title, options),
    [createToast]
  );

  const dismiss = useCallback(
    (id: string) => removeNotification(id),
    [removeNotification]
  );

  return {
    success,
    error,
    info,
    warning,
    dismiss,
    // Also expose the raw addNotification for advanced use cases
    addNotification,
  };
}

export default useToast;
