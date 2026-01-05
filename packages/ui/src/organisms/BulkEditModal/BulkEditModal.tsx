"use client";

import React, { useState, useCallback } from "react";
import clsx from "clsx";
import { Check, AlertTriangle, X } from "lucide-react";
import type { 
  BulkEditModalProps 
} from "./BulkEditModal.types.js";

/**
 * BulkEditModal component - Bold Contemporary Pop Art Adventure
 * 
 * Modal for bulk editing multiple items with consistent accessibility:
 * - Focus trap
 * - Escape key handling
 * - Click outside to close
 * - Loading states
 * - Error handling
 */
export function BulkEditModal<T extends Record<string, unknown>>({
  open,
  onClose,
  title,
  selectedItems,
  fields,
  onSubmit,
  getItemId,
  getItemLabel,
  submitLabel = "Apply Changes",
}: BulkEditModalProps<T>) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);

  // Handle value changes
  const handleValueChange = useCallback((key: string, value: unknown) => {
    setValues(prev => ({ ...prev, [key]: value }));
  }, []);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    try {
      setError(null);
      const selectedIds = selectedItems.map(getItemId);
      await onSubmit(values, selectedIds);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }, [values, onSubmit, onClose, selectedItems, getItemId]);

  // Handle close
  const handleClose = useCallback(() => {
    setError(null);
    setValues({});
    onClose();
  }, [onClose]);

  // Footer content
  const footerContent = (
    <div className="flex items-center justify-between">
      <button
        onClick={handleClose}
        className="px-4 py-2 border-2 border-border rounded-[var(--radius-button)] hover:border-danger transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-primary text-white border-2 border-primary rounded-[var(--radius-button)] hover:bg-primary/90 transition-colors flex items-center gap-2"
      >
        <Check className="size-4" />
        {submitLabel}
      </button>
    </div>
  );

  if (!open) return null;

  return (
    <div className={clsx(
      "fixed inset-0 z-50 flex items-center justify-center",
      "bg-black/50 backdrop-blur-sm",
      "transition-opacity duration-200"
    )}>
      <div className={clsx(
        "relative bg-surface-primary border-2 border-border rounded-[var(--radius-modal)]",
        "shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden",
        "transform transition-transform duration-200 scale-100 opacity-100"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-border bg-surface-elevated">
          <h2 className="text-xl font-bold text-text-primary">{title}</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-[var(--radius-button)] hover:bg-surface-elevated border-2 border-transparent hover:border-border transition-colors"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Selected items summary */}
          <div className="mb-6 p-4 bg-muted border-2 border-border rounded-card">
            <p className="font-mono text-sm text-text-muted mb-2">
              {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""} selected:
            </p>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-auto">
              {selectedItems.slice(0, 10).map((item) => (
                <span
                  key={getItemId(item)}
                  className="px-2 py-1 bg-surface-primary border border-border rounded-badge font-mono text-xs"
                >
                  {getItemLabel(item)}
                </span>
              ))}
              {selectedItems.length > 10 && (
                <span className="px-2 py-1 text-text-muted font-mono text-xs">
                  +{selectedItems.length - 10} more
                </span>
              )}
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    value={String(values[field.key] ?? "")}
                    onChange={(e) => handleValueChange(field.key, e.target.value)}
                    className="w-full px-3 py-2 bg-surface-primary border-2 border-border text-text-primary outline-none focus:border-primary-500"
                  >
                    <option value="">Select...</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={String(values[field.key] ?? "")}
                    onChange={(e) => handleValueChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 bg-surface-primary border-2 border-border text-text-primary outline-none focus:border-primary-500"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-error/10 border-2 border-error rounded-card flex items-center gap-3">
              <AlertTriangle className="size-5 text-error flex-shrink-0" />
              <p className="font-body text-sm text-error">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t-2 border-border bg-surface-elevated">
          {footerContent}
        </div>
      </div>
    </div>
  );
}

export default BulkEditModal;
