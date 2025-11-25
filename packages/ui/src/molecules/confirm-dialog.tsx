"use client";

import React from "react";
import { colors, typography, fontSizes, letterSpacing, transitions, borderWidths } from "../tokens.js";

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

const variantStyles: Record<ConfirmDialogVariant, { icon: string; confirmBg: string; confirmHoverBg: string }> = {
  danger: {
    icon: "⚠️",
    confirmBg: colors.black,
    confirmHoverBg: colors.grey900,
  },
  warning: {
    icon: "⚡",
    confirmBg: colors.black,
    confirmHoverBg: colors.grey900,
  },
  info: {
    icon: "ℹ️",
    confirmBg: colors.black,
    confirmHoverBg: colors.grey900,
  },
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
  const styles = variantStyles[variant];

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
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
        onClick={loading ? undefined : onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        style={{
          position: "relative",
          backgroundColor: colors.white,
          border: `${borderWidths.medium} solid ${colors.black}`,
          boxShadow: "8px 8px 0 0 #000000",
          width: "100%",
          maxWidth: "400px",
          padding: "1.5rem",
        }}
      >
        {/* Icon and Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <span style={{ fontSize: "24px" }}>{styles.icon}</span>
          <h2
            id="confirm-dialog-title"
            style={{
              fontFamily: typography.heading,
              fontSize: fontSizes.h4MD,
              letterSpacing: letterSpacing.wider,
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            {title}
          </h2>
        </div>

        {/* Message */}
        <p
          id="confirm-dialog-description"
          style={{
            fontFamily: typography.body,
            fontSize: fontSizes.bodyMD,
            color: colors.grey700,
            marginBottom: details ? "0.75rem" : "1.5rem",
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>

        {/* Details */}
        {details && (
          <div
            style={{
              fontFamily: typography.mono,
              fontSize: fontSizes.monoSM,
              color: colors.grey600,
              backgroundColor: colors.grey100,
              padding: "0.75rem",
              marginBottom: "1.5rem",
              border: `1px solid ${colors.grey200}`,
            }}
          >
            {details}
          </div>
        )}

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "0.75rem 1.5rem",
              fontFamily: typography.heading,
              fontSize: fontSizes.bodyMD,
              letterSpacing: letterSpacing.wider,
              textTransform: "uppercase",
              backgroundColor: colors.white,
              color: colors.black,
              border: `${borderWidths.medium} solid ${colors.black}`,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
              transition: transitions.fast,
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "0.75rem 1.5rem",
              fontFamily: typography.heading,
              fontSize: fontSizes.bodyMD,
              letterSpacing: letterSpacing.wider,
              textTransform: "uppercase",
              backgroundColor: styles.confirmBg,
              color: colors.white,
              border: `${borderWidths.medium} solid ${colors.black}`,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: transitions.fast,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {loading && (
              <span
                style={{
                  display: "inline-block",
                  width: "14px",
                  height: "14px",
                  border: `2px solid ${colors.grey300}`,
                  borderTopColor: colors.white,
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>
        {`@keyframes spin { to { transform: rotate(360deg); } }`}
      </style>
    </div>
  );
}

export default ConfirmDialog;
