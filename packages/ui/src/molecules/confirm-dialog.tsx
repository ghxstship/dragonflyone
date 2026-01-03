"use client";

import React from "react";
import clsx from "clsx";
import { AlertTriangle, Zap, Info } from "lucide-react";
import { OverlayLayout } from "../templates/overlay-layout.js";

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
  /** Cancel action handler - also serves as onClose */
  onCancel: () => void;
  /** Alias for onCancel for API consistency */
  onClose?: () => void;
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

const variantColors: Record<ConfirmDialogVariant, string> = {
  danger: "text-error",
  warning: "text-warning",
  info: "text-primary-500",
};

/**
 * ConfirmDialog component - Bold Contemporary Pop Art Adventure
 * 
 * Built on OverlayLayout for consistent accessibility and behavior:
 * - Focus trap
 * - Escape key handling
 * - Body scroll prevention
 * - ARIA attributes
 * 
 * Features:
 * - Heavy 4px border for maximum impact
 * - Pop-in animation
 * - Bold action buttons with hover lift
 * - Hard offset shadow
 * - Variant-specific icons and colors
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
  onClose,
  details,
  inverted = false,
  className = "",
}: ConfirmDialogProps) {
  const icon = variantIcons[variant];
  const iconColor = variantColors[variant];
  const handleClose = onClose || onCancel;

  const footerContent = (
    <div className="flex gap-3 justify-end">
      <button
        type="button"
        onClick={handleClose}
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
            "inline-block w-3 h-3 border-2 rounded-[var(--radius-circle)] animate-spin",
            inverted ? "border-border border-t-on-light-primary" : "border-border border-t-on-dark-primary"
          )} />
        )}
        {confirmLabel}
      </button>
    </div>
  );

  const headerContent = (
    <div className={clsx(
      "flex items-center gap-3 px-6 py-4 border-b-2",
      inverted ? "border-border" : "border-border"
    )}>
      <span className={clsx("text-2xl", iconColor)}>{icon}</span>
      <h2
        id="confirm-dialog-title"
        className={clsx(
          "font-heading text-lg tracking-wider uppercase font-bold",
          inverted ? "text-on-dark-primary" : "text-on-light-primary"
        )}
      >
        {title}
      </h2>
    </div>
  );

  return (
    <OverlayLayout
      type="modal"
      size="sm"
      open={open}
      onClose={handleClose}
      closeOnEscape={!loading}
      closeOnBackdrop={!loading}
      preventScroll
      animation="scale"
      inverted={inverted}
      showClose={false}
      headerContent={headerContent}
      footerContent={footerContent}
      className={className}
      ariaLabel={title}
      ariaDescribedBy="confirm-dialog-description"
      contentClassName={clsx(
        "border-4",
        inverted ? "border-on-dark-primary" : "border-border-primary"
      )}
    >
      {/* Message */}
      <p
        id="confirm-dialog-description"
        className={clsx(
          "font-body text-base leading-relaxed",
          inverted ? "text-on-dark-secondary" : "text-on-light-muted",
          details ? "mb-3" : ""
        )}
      >
        {message}
      </p>

      {/* Details */}
      {details && (
        <div className={clsx(
          "font-code text-sm p-3 mt-4 border-2 rounded-[var(--radius-badge)]",
          inverted
            ? "text-on-dark-muted bg-surface-elevated border-border"
            : "text-on-dark-disabled bg-muted border-border"
        )}>
          {details}
        </div>
      )}
    </OverlayLayout>
  );
}

export default ConfirmDialog;
