"use client";

import React, { useState, useMemo, useCallback } from "react";
import clsx from "clsx";
import { X, Check, AlertTriangle, Loader2 } from "lucide-react";

export interface BulkEditField {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "date" | "checkbox";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface BulkEditModalProps<T> {
  open: boolean;
  onClose: () => void;
  selectedItems: T[];
  fields: BulkEditField[];
  onSubmit: (updates: Record<string, unknown>, selectedIds: string[]) => Promise<void>;
  getItemId: (item: T) => string;
  getItemLabel: (item: T) => string;
  title?: string;
  description?: string;
  submitLabel?: string;
  className?: string;
}

export function BulkEditModal<T>({
  open,
  onClose,
  selectedItems,
  fields,
  onSubmit,
  getItemId,
  getItemLabel,
  title = "Bulk Edit",
  description,
  submitLabel = "Apply Changes",
  className = "",
}: BulkEditModalProps<T>) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [enabledFields, setEnabledFields] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedIds = useMemo(
    () => selectedItems.map(getItemId),
    [selectedItems, getItemId]
  );

  const handleFieldToggle = useCallback((fieldKey: string) => {
    setEnabledFields((prev) => {
      const next = new Set(prev);
      if (next.has(fieldKey)) {
        next.delete(fieldKey);
        setValues((v) => {
          const copy = { ...v };
          delete copy[fieldKey];
          return copy;
        });
      } else {
        next.add(fieldKey);
      }
      return next;
    });
  }, []);

  const handleValueChange = useCallback((fieldKey: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [fieldKey]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (enabledFields.size === 0) {
      setError("Please select at least one field to update");
      return;
    }

    const updates: Record<string, unknown> = {};
    enabledFields.forEach((key) => {
      updates[key] = values[key];
    });

    setLoading(true);
    setError(null);

    try {
      await onSubmit(updates, selectedIds);
      onClose();
      setValues({});
      setEnabledFields(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply changes");
    } finally {
      setLoading(false);
    }
  }, [enabledFields, values, selectedIds, onSubmit, onClose]);

  const handleClose = useCallback(() => {
    if (!loading) {
      onClose();
      setValues({});
      setEnabledFields(new Set());
      setError(null);
    }
  }, [loading, onClose]);

  if (!open) return null;

  return (
    <div
      className={clsx("fixed inset-0 z-modal flex items-center justify-center", className)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-edit-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface-primary border-2 border-black shadow-[6px_6px_0_black] rounded-modal overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-spacing-6 py-spacing-4 border-b-2 border-black bg-black text-white">
          <h2 id="bulk-edit-title" className="font-heading text-h4-md tracking-wider uppercase">
            {title}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="p-spacing-1 bg-transparent border-none text-white cursor-pointer hover:text-on-dark-secondary disabled:cursor-not-allowed"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-spacing-6 max-h-[60vh] overflow-auto">
          {/* Description */}
          {description && (
            <p className="font-body text-body-sm text-text-secondary mb-spacing-4">
              {description}
            </p>
          )}

          {/* Selected items summary */}
          <div className="mb-spacing-6 p-spacing-4 bg-surface-secondary border-2 border-border-primary rounded-card">
            <p className="font-code text-mono-sm text-on-dark-disabled mb-spacing-2">
              {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""} selected:
            </p>
            <div className="flex flex-wrap gap-gap-xs max-h-spacing-24 overflow-auto">
              {selectedItems.slice(0, 10).map((item) => (
                <span
                  key={getItemId(item)}
                  className="px-spacing-2 py-spacing-1 bg-surface-primary border border-border-secondary rounded-badge font-code text-mono-xs"
                >
                  {getItemLabel(item)}
                </span>
              ))}
              {selectedItems.length > 10 && (
                <span className="px-spacing-2 py-spacing-1 text-on-dark-disabled font-code text-mono-xs">
                  +{selectedItems.length - 10} more
                </span>
              )}
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-spacing-4">
            <p className="font-code text-mono-sm tracking-wide uppercase text-on-dark-disabled">
              Select fields to update:
            </p>

            {fields.map((field) => {
              const isEnabled = enabledFields.has(field.key);
              return (
                <div
                  key={field.key}
                  className={clsx(
                    "p-spacing-4 border-2 rounded-card transition-colors duration-fast",
                    isEnabled ? "border-primary-500 bg-primary-50" : "border-border-primary bg-surface-primary"
                  )}
                >
                  <label className="flex items-center gap-gap-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => handleFieldToggle(field.key)}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <span className="font-code text-mono-sm tracking-wide uppercase">
                      {field.label}
                    </span>
                  </label>

                  {isEnabled && (
                    <div className="mt-spacing-3 pl-spacing-8">
                      {field.type === "select" ? (
                        <select
                          value={String(values[field.key] ?? "")}
                          onChange={(e) => handleValueChange(field.key, e.target.value)}
                          className="w-full px-spacing-3 py-spacing-2 bg-surface-primary border-2 border-border-primary text-text-primary outline-none focus:border-primary-500"
                        >
                          <option value="">{field.placeholder || "Select..."}</option>
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "checkbox" ? (
                        <label className="flex items-center gap-gap-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(values[field.key])}
                            onChange={(e) => handleValueChange(field.key, e.target.checked)}
                            className="w-5 h-5 cursor-pointer"
                          />
                          <span className="font-body text-body-sm">Set to checked</span>
                        </label>
                      ) : field.type === "number" ? (
                        <input
                          type="number"
                          value={values[field.key] === undefined ? "" : String(values[field.key])}
                          onChange={(e) => handleValueChange(field.key, e.target.valueAsNumber || null)}
                          placeholder={field.placeholder}
                          className="w-full px-spacing-3 py-spacing-2 bg-surface-primary border-2 border-border-primary text-text-primary outline-none focus:border-primary-500"
                        />
                      ) : field.type === "date" ? (
                        <input
                          type="date"
                          value={String(values[field.key] ?? "")}
                          onChange={(e) => handleValueChange(field.key, e.target.value)}
                          className="w-full px-spacing-3 py-spacing-2 bg-surface-primary border-2 border-border-primary text-text-primary outline-none focus:border-primary-500"
                        />
                      ) : (
                        <input
                          type="text"
                          value={String(values[field.key] ?? "")}
                          onChange={(e) => handleValueChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-spacing-3 py-spacing-2 bg-surface-primary border-2 border-border-primary text-text-primary outline-none focus:border-primary-500"
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-spacing-4 p-spacing-3 bg-error-50 border-2 border-error-500 rounded-card flex items-center gap-gap-sm">
              <AlertTriangle className="size-5 text-error-500 flex-shrink-0" />
              <p className="font-body text-body-sm text-error-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-gap-sm px-spacing-6 py-spacing-4 border-t-2 border-border-primary bg-surface-secondary">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-spacing-4 py-spacing-2 font-code text-mono-sm tracking-wide uppercase bg-surface-primary text-text-primary border-2 border-border-primary cursor-pointer hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || enabledFields.size === 0}
            className="flex items-center gap-gap-xs px-spacing-4 py-spacing-2 font-code text-mono-sm tracking-wide uppercase bg-black text-white border-2 border-black cursor-pointer hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Check className="size-4" />
                {submitLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BulkEditModal;
