"use client";

import React from "react";
import clsx from "clsx";
import { AlertTriangle, Zap, Info } from "lucide-react";

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

const variantIcons: Record<ConfirmDialogVariant, React.ReactNode> = {
  danger: <AlertTriangle className="size-6" />,
  warning: <Zap className="size-6" />,
  info: <Info className="size-6" />,
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
          inverted ? "bg-surface-overlay" : "bg-surface-overlay"
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
          ? "bg-surface-inverse border-on-dark-primary text-on-dark-primary shadow-lg"
          : "bg-surface-primary border-border-primary text-on-light-primary shadow-lg"
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
            inverted ? "text-on-dark-secondary" : "text-on-light-muted",
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
              ? "text-on-dark-muted bg-surface-elevated border-border"
              : "text-on-dark-disabled bg-muted border-border"
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
              "px-6 py-3 font-heading text-sm tracking-wider uppercase font-bold leading-none",
              "border-2 rounded-[var(--radius-button)]",
              "transition-all duration-100 ease-[var(--ease-bounce)]",
              "hover:-translate-x-0.5 hover:-translate-y-0.5",
              "active:translate-x-0 active:translate-y-0",
              inverted
                ? "bg-transparent text-on-dark-secondary border-border hover:bg-surface-elevated hover:shadow-sm"
                : "bg-surface-primary text-on-light-primary border-border-primary hover:bg-muted hover:shadow-sm",
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
              "px-6 py-3 font-heading text-sm tracking-wider uppercase font-bold leading-none",
              "border-2 rounded-[var(--radius-button)]",
              "transition-all duration-100 ease-[var(--ease-bounce)]",
              "flex items-center gap-2",
              "hover:-translate-x-0.5 hover:-translate-y-0.5",
              "active:translate-x-0 active:translate-y-0",
              inverted
                ? "bg-surface-primary text-on-light-primary border-on-dark-primary shadow-primary hover:shadow-primary"
                : "bg-surface-inverse text-on-dark-primary border-border-primary shadow-primary hover:shadow-primary",
              loading ? "cursor-not-allowed opacity-70" : "cursor-pointer"
            )}
          >
            {loading && (
              <span className={clsx(
                "inline-block w-3 h-3 border-2 rounded-full animate-spin",
                inverted ? "border-border border-t-on-light-primary" : "border-border border-t-on-dark-primary"
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
