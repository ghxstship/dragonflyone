"use client";

import React from "react";
import { AlertTriangle, Zap, Info } from "lucide-react";
import { 
  confirmDialogVariants,
  confirmDialogIconVariants,
  confirmDialogTitleVariants,
  confirmDialogMessageVariants,
  confirmDialogDetailsVariants 
} from "./ConfirmDialog.variants.js";
import type { ConfirmDialogProps, ConfirmDialogIcons } from "./ConfirmDialog.types.js";

/**
 * ConfirmDialog component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Icon emphasis
 * - Confirmation dialogs with variants
 * - CVA-based variants for consistent theming
 * - Loading states
 * 
 * @example
 * ```tsx
 * <ConfirmDialog
 *   open={isOpen}
 *   title="Delete Item"
 *   message="Are you sure you want to delete this item? This action cannot be undone."
 *   variant="danger"
 *   onConfirm={() => console.log('Confirmed')}
 *   onCancel={() => setIsOpen(false)}
 * />
 * ```
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
  className,
}: ConfirmDialogProps) {
  // Handle both onCancel and onClose for API consistency
  const handleCancel = () => {
    onCancel();
    if (onClose) {
      onClose();
    }
  };

  // Icon mapping for variants
  const variantIcons: ConfirmDialogIcons = {
    danger: <AlertTriangle className="w-6 h-6" />,
    warning: <Zap className="w-6 h-6" />,
    info: <Info className="w-6 h-6" />,
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-[var(--duration-fast)]"
        onClick={handleCancel}
      />
      
      {/* Dialog */}
      <div className={confirmDialogVariants({ variant, className })}>
        {/* Icon */}
        <div className={confirmDialogIconVariants({ variant })}>
          {variantIcons[variant]}
        </div>

        {/* Title */}
        <h3 className={confirmDialogTitleVariants({})}>
          {title}
        </h3>

        {/* Message */}
        <p className={confirmDialogMessageVariants({})}>
          {message}
        </p>

        {/* Details */}
        {details && (
          <div className={confirmDialogDetailsVariants({})}>
            {details}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 border-2 rounded-button font-medium transition-all duration-[var(--duration-fast)] ease-[var(--easing-easeOut)] bg-surface-elevated border-border text-text-primary hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2 border-2 rounded-button font-medium transition-all duration-[var(--duration-fast)] ease-[var(--easing-easeOut)] ${
              variant === "danger"
                ? "bg-error-500 border-error-500 text-white hover:bg-error-600"
                : variant === "warning"
                ? "bg-warning-500 border-warning-500 text-white hover:bg-warning-600"
                : "bg-brand-primary border-brand-primary text-white hover:bg-brand-primary-hover shadow-primary"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                {confirmLabel}
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
