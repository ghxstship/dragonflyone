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
  /** Inverted theme (dark background) */
  inverted?: boolean;
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
  inverted = false,
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
        "fixed inset-0 z-popover flex items-center justify-center p-spacing-4",
        className
      )}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      {/* Backdrop */}
      <div
        className={clsx("absolute inset-0", inverted ? "bg-white/20" : "bg-black/50")}
        onClick={loading ? undefined : onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className={clsx(
        "relative border-2 shadow-hard-lg w-full max-w-container-md p-spacing-6",
        inverted
          ? "bg-ink-900 border-grey-600 text-white"
          : "bg-white border-black text-black"
      )}>
        {/* Icon and Title */}
        <div className="flex items-center gap-gap-sm mb-spacing-4">
          <span className="text-h3-md">{icon}</span>
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
            "font-body text-body-md leading-relaxed",
            inverted ? "text-grey-300" : "text-grey-700",
            details ? "mb-spacing-3" : "mb-spacing-6"
          )}
        >
          {message}
        </p>

        {/* Details */}
        {details && (
          <div className={clsx(
            "font-code text-mono-sm p-spacing-3 mb-spacing-6 border",
            inverted
              ? "text-grey-400 bg-grey-800 border-grey-700"
              : "text-grey-600 bg-grey-100 border-grey-200"
          )}>
            {details}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-gap-sm justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={clsx(
              "px-spacing-6 py-spacing-3 font-heading text-body-md tracking-wider uppercase border-2 transition-colors duration-fast",
              inverted
                ? "bg-transparent text-grey-300 border-grey-500 hover:bg-grey-800"
                : "bg-white text-black border-black hover:bg-grey-100",
              loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            )}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={clsx(
              "px-spacing-6 py-spacing-3 font-heading text-body-md tracking-wider uppercase border-2 transition-colors duration-fast flex items-center gap-gap-xs",
              inverted
                ? "bg-white text-black border-white hover:bg-grey-200"
                : "bg-black text-white border-black hover:bg-grey-900",
              loading ? "cursor-not-allowed opacity-70" : "cursor-pointer"
            )}
          >
            {loading && (
              <span className={clsx(
                "inline-block w-spacing-3 h-spacing-3 border-2 rounded-full animate-spin",
                inverted ? "border-grey-400 border-t-black" : "border-grey-300 border-t-white"
              )} />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
