"use client";

import React from "react";
import clsx from "clsx";

export type ConfirmDialogVariant = "danger" | "warning" | "info";

export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Dialog title */
  title: string;
  /** Dialog message/description */
  message: string;
  /** Confirm button label */
  confirmLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Visual variant for the dialog */
  variant?: ConfirmDialogVariant;
  /** Loading state for confirm action */
  loading?: boolean;
  /** Confirm action handler */
  onConfirm: () => void;
  /** Cancel action handler */
  onCancel: () => void;
  /** Additional details or warning text */
  details?: string;
  /** Custom className */
  className?: string;
}

const variantIcons: Record<ConfirmDialogVariant, string> = {
  danger: "⚠️",
  warning: "⚡",
  info: "ℹ️",
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "info",
  loading = false,
  onConfirm,
  onCancel,
  details,
  className = "",
}: ConfirmDialogProps) {
  const icon = variantIcons[variant];

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && !loading) {
        onCancel();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className={clsx(
        "fixed inset-0 z-popover flex items-center justify-center p-4",
        className
      )}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={loading ? undefined : onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative bg-white border-2 border-black shadow-hard-lg w-full max-w-[400px] p-6">
        {/* Icon and Title */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{icon}</span>
          <h2
            id="confirm-dialog-title"
            className="font-heading text-h4-md tracking-wider uppercase"
          >
            {title}
          </h2>
        </div>

        {/* Message */}
        <p
          id="confirm-dialog-description"
          className={clsx(
            "font-body text-body-md text-grey-700 leading-relaxed",
            details ? "mb-3" : "mb-6"
          )}
        >
          {message}
        </p>

        {/* Details */}
        {details && (
          <div className="font-code text-mono-sm text-grey-600 bg-grey-100 p-3 mb-6 border border-grey-200">
            {details}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={clsx(
              "px-6 py-3 font-heading text-body-md tracking-wider uppercase bg-white text-black border-2 border-black transition-colors duration-fast",
              loading ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-grey-100"
            )}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={clsx(
              "px-6 py-3 font-heading text-body-md tracking-wider uppercase bg-black text-white border-2 border-black transition-colors duration-fast flex items-center gap-2",
              loading ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:bg-grey-900"
            )}
          >
            {loading && (
              <span className="inline-block w-3.5 h-3.5 border-2 border-grey-300 border-t-white rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
