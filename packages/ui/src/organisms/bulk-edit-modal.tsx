"use client";

import React, { useState, useMemo, useCallback } from "react";
import clsx from "clsx";
import { Check, AlertTriangle, Loader2 } from "lucide-react";
import { OverlayLayout } from "../templates/overlay-layout.js";

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

/**
 * BulkEditModal component - Bold Contemporary Pop Art Adventure
 * 
 * Built on OverlayLayout for consistent accessibility and behavior:
 * - Focus trap
 * - Escape key handling
 * - Body scroll prevention
 * - ARIA attributes
 * 
 * Features:
 * - Field selection for bulk update
 * - Dynamic form rendering
 * - Loading/error states
 * - Selected items summary
 */
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

  const footerContent = (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={handleClose}
        disabled={loading}
        className="px-4 py-2 font-mono text-sm tracking-wide uppercase bg-surface-primary text-on-light-primary border-2 border-border cursor-pointer hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || enabledFields.size === 0}
        className="flex items-center gap-2 px-4 py-2 font-mono text-sm tracking-wide uppercase bg-surface-inverse text-on-dark-primary border-2 border-border cursor-pointer hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-50"
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
  );

  return (
    <OverlayLayout
      type="modal"
      size="md"
      open={open}
      onClose={handleClose}
      title={title}
      closeOnEscape={!loading}
      closeOnBackdrop={!loading}
      preventScroll
      animation="scale"
      inverted={false}
      showClose={!loading}
      footerContent={footerContent}
      className={className}
      ariaLabel={title}
    >
      {/* Description */}
      {description && (
        <p className="font-body text-sm text-on-light-muted mb-4">
          {description}
        </p>
      )}

      {/* Selected items summary */}
      <div className="mb-6 p-4 bg-muted border-2 border-border rounded-card">
        <p className="font-mono text-sm text-on-light-muted mb-2">
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
            <span className="px-2 py-1 text-on-light-muted font-mono text-xs">
              +{selectedItems.length - 10} more
            </span>
          )}
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <p className="font-mono text-sm tracking-wide uppercase text-on-light-muted">
          Select fields to update:
        </p>

        {fields.map((field) => {
          const isEnabled = enabledFields.has(field.key);
          return (
            <div
              key={field.key}
              className={clsx(
                "p-4 border-2 rounded-card transition-colors duration-100",
                isEnabled ? "border-primary-500 bg-primary-500/10" : "border-border bg-surface-primary"
              )}
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={() => handleFieldToggle(field.key)}
                  className="w-5 h-5 cursor-pointer"
                />
                <span className="font-mono text-sm tracking-wide uppercase">
                  {field.label}
                </span>
              </label>

              {isEnabled && (
                <div className="mt-3 pl-8">
                  {field.type === "select" ? (
                    <select
                      value={String(values[field.key] ?? "")}
                      onChange={(e) => handleValueChange(field.key, e.target.value)}
                      className="w-full px-3 py-2 bg-surface-primary border-2 border-border text-on-light-primary outline-none focus:border-primary-500"
                    >
                      <option value="">{field.placeholder || "Select..."}</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "checkbox" ? (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(values[field.key])}
                        onChange={(e) => handleValueChange(field.key, e.target.checked)}
                        className="w-5 h-5 cursor-pointer"
                      />
                      <span className="font-body text-sm">Set to checked</span>
                    </label>
                  ) : field.type === "number" ? (
                    <input
                      type="number"
                      value={values[field.key] === undefined ? "" : String(values[field.key])}
                      onChange={(e) => handleValueChange(field.key, e.target.valueAsNumber || null)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 bg-surface-primary border-2 border-border text-on-light-primary outline-none focus:border-primary-500"
                    />
                  ) : field.type === "date" ? (
                    <input
                      type="date"
                      value={String(values[field.key] ?? "")}
                      onChange={(e) => handleValueChange(field.key, e.target.value)}
                      className="w-full px-3 py-2 bg-surface-primary border-2 border-border text-on-light-primary outline-none focus:border-primary-500"
                    />
                  ) : (
                    <input
                      type="text"
                      value={String(values[field.key] ?? "")}
                      onChange={(e) => handleValueChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 bg-surface-primary border-2 border-border text-on-light-primary outline-none focus:border-primary-500"
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
        <div className="mt-4 p-3 bg-error/10 border-2 border-error rounded-card flex items-center gap-3">
          <AlertTriangle className="size-5 text-error flex-shrink-0" />
          <p className="font-body text-sm text-error">{error}</p>
        </div>
      )}
    </OverlayLayout>
  );
}

export default BulkEditModal;
