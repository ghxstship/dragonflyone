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

/**
 * ConfirmDialog component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Heavy 4px border for maximum impact
 * - Pop-in animation
 * - Bold action buttons with hover lift
 * - Hard offset shadow
 */
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
        className={clsx(
          "absolute inset-0 animate-fade-in",
          inverted ? "bg-white/20" : "bg-black/60"
        )}
        onClick={loading ? undefined : onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className={clsx(
        "relative w-full max-w-md p-6",
        "border-4 rounded-[var(--radius-modal)]",
        "animate-pop-in",
        inverted
          ? "bg-ink-900 border-white text-white shadow-[6px_6px_0_rgba(255,255,255,0.25)]"
          : "bg-white border-black text-black shadow-[6px_6px_0_rgba(0,0,0,0.2)]"
      )}>
        {/* Icon and Title */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{icon}</span>
          <h2
            id="confirm-dialog-title"
            className="font-heading text-lg tracking-wider uppercase font-bold"
          >
            {title}
          </h2>
        </div>

        {/* Message */}
        <p
          id="confirm-dialog-description"
          className={clsx(
            "font-body text-base leading-relaxed",
            inverted ? "text-grey-300" : "text-grey-700",
            details ? "mb-3" : "mb-6"
          )}
        >
          {message}
        </p>

        {/* Details */}
        {details && (
          <div className={clsx(
            "font-code text-sm p-3 mb-6 border-2 rounded-[var(--radius-badge)]",
            inverted
              ? "text-grey-400 bg-grey-800 border-grey-700"
              : "text-grey-600 bg-grey-100 border-grey-200"
          )}>
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
              "px-6 py-3 font-heading text-sm tracking-wider uppercase font-bold",
              "border-2 rounded-[var(--radius-button)]",
              "transition-all duration-100 ease-[var(--ease-bounce)]",
              "hover:-translate-x-0.5 hover:-translate-y-0.5",
              "active:translate-x-0 active:translate-y-0",
              inverted
                ? "bg-transparent text-grey-300 border-grey-500 hover:bg-grey-800 hover:shadow-[2px_2px_0_rgba(255,255,255,0.1)]"
                : "bg-white text-black border-black hover:bg-grey-100 hover:shadow-[2px_2px_0_rgba(0,0,0,0.1)]",
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
              "px-6 py-3 font-heading text-sm tracking-wider uppercase font-bold",
              "border-2 rounded-[var(--radius-button)]",
              "transition-all duration-100 ease-[var(--ease-bounce)]",
              "flex items-center gap-2",
              "hover:-translate-x-0.5 hover:-translate-y-0.5",
              "active:translate-x-0 active:translate-y-0",
              inverted
                ? "bg-white text-black border-white shadow-[3px_3px_0_hsl(239,84%,67%)] hover:shadow-[4px_4px_0_hsl(239,84%,67%)]"
                : "bg-black text-white border-black shadow-[3px_3px_0_hsl(239,84%,67%)] hover:shadow-[4px_4px_0_hsl(239,84%,67%)]",
              loading ? "cursor-not-allowed opacity-70" : "cursor-pointer"
            )}
          >
            {loading && (
              <span className={clsx(
                "inline-block w-3 h-3 border-2 rounded-full animate-spin",
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
