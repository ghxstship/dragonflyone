"use client";

import React, { useState, useCallback } from "react";
import clsx from "clsx";
import { Calendar, Link2, Hash, Type, ToggleLeft, List, Calculator, Lock, Loader2 } from "lucide-react";

export type CustomFieldType =
  | "text"
  | "number"
  | "date"
  | "datetime"
  | "select"
  | "multiselect"
  | "checkbox"
  | "url"
  | "email"
  | "phone"
  | "currency"
  | "percent"
  | "formula"
  | "reference"
  | "rich_text";

export type FieldPermission = "editable" | "readonly" | "hidden";

export interface CustomFieldOption {
  value: string;
  label: string;
  color?: string;
}

export interface CustomFieldDefinition {
  id: string;
  key: string;
  label: string;
  type: CustomFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: CustomFieldOption[];
  formula?: string;
  referenceEntity?: string;
  referenceDisplayField?: string;
  permission?: FieldPermission;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    patternMessage?: string;
  };
  defaultValue?: unknown;
  currencyCode?: string;
}

export interface CustomFieldRendererProps {
  field: CustomFieldDefinition;
  value: unknown;
  onChange?: (value: unknown) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  compact?: boolean;
  showLabel?: boolean;
  className?: string;
  pendingSync?: boolean;
  referenceOptions?: CustomFieldOption[];
  onReferenceSearch?: (query: string) => Promise<CustomFieldOption[]>;
}

const fieldIcons: Partial<Record<CustomFieldType, React.ReactNode>> = {
  text: <Type className="size-4" />,
  number: <Hash className="size-4" />,
  date: <Calendar className="size-4" />,
  datetime: <Calendar className="size-4" />,
  select: <List className="size-4" />,
  multiselect: <List className="size-4" />,
  checkbox: <ToggleLeft className="size-4" />,
  url: <Link2 className="size-4" />,
  formula: <Calculator className="size-4" />,
  reference: <Link2 className="size-4" />,
};

export function CustomFieldRenderer({
  field,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  compact = false,
  showLabel = true,
  className = "",
  pendingSync = false,
  referenceOptions = [],
  onReferenceSearch,
}: CustomFieldRendererProps) {
  const [referenceSearching, setReferenceSearching] = useState(false);
  const [referenceResults, setReferenceResults] = useState<CustomFieldOption[]>(referenceOptions);

  const permission = field.permission || "editable";
  const isReadonly = permission === "readonly" || disabled;
  const isHidden = permission === "hidden";

  const handleReferenceSearch = useCallback(
    async (query: string) => {
      if (!onReferenceSearch) return;
      setReferenceSearching(true);
      try {
        const results = await onReferenceSearch(query);
        setReferenceResults(results);
      } finally {
        setReferenceSearching(false);
      }
    },
    [onReferenceSearch]
  );

  if (isHidden) return null;

  const baseInputClass = clsx(
    "w-full bg-surface-primary border-2 text-text-primary outline-none transition-colors duration-fast",
    compact ? "px-spacing-2 py-spacing-1 text-body-sm" : "px-spacing-3 py-spacing-2 text-body-md",
    error ? "border-error-500" : "border-border-primary focus:border-primary-500",
    isReadonly && "bg-surface-secondary cursor-not-allowed opacity-75"
  );

  const renderInput = () => {
    switch (field.type) {
      case "text":
      case "email":
      case "phone":
      case "url":
        return (
          <input
            type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
            value={String(value ?? "")}
            onChange={(e) => onChange?.(e.target.value)}
            onBlur={onBlur}
            placeholder={field.placeholder}
            disabled={isReadonly}
            className={baseInputClass}
            aria-invalid={!!error}
            aria-describedby={error ? `${field.id}-error` : undefined}
          />
        );

      case "number":
      case "currency":
      case "percent":
        return (
          <div className="relative">
            {field.type === "currency" && field.currencyCode && (
              <span className="absolute left-spacing-3 top-1/2 -translate-y-1/2 text-on-dark-disabled font-code text-mono-sm">
                {field.currencyCode}
              </span>
            )}
            <input
              type="number"
              value={value === null || value === undefined ? "" : String(value)}
              onChange={(e) => onChange?.(e.target.valueAsNumber || null)}
              onBlur={onBlur}
              placeholder={field.placeholder}
              disabled={isReadonly}
              min={field.validation?.min}
              max={field.validation?.max}
              className={clsx(
                baseInputClass,
                field.type === "currency" && field.currencyCode && "pl-spacing-10"
              )}
              aria-invalid={!!error}
            />
            {field.type === "percent" && (
              <span className="absolute right-spacing-3 top-1/2 -translate-y-1/2 text-on-dark-disabled font-code text-mono-sm">
                %
              </span>
            )}
          </div>
        );

      case "date":
      case "datetime":
        return (
          <input
            type={field.type === "datetime" ? "datetime-local" : "date"}
            value={String(value ?? "")}
            onChange={(e) => onChange?.(e.target.value)}
            onBlur={onBlur}
            disabled={isReadonly}
            className={baseInputClass}
            aria-invalid={!!error}
          />
        );

      case "select":
        return (
          <select
            value={String(value ?? "")}
            onChange={(e) => onChange?.(e.target.value)}
            onBlur={onBlur}
            disabled={isReadonly}
            className={baseInputClass}
            aria-invalid={!!error}
          >
            <option value="">{field.placeholder || "Select..."}</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case "multiselect":
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-spacing-1">
            {field.options?.map((opt) => (
              <label
                key={opt.value}
                className={clsx(
                  "flex items-center gap-gap-xs cursor-pointer",
                  isReadonly && "cursor-not-allowed opacity-75"
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(opt.value)}
                  onChange={(e) => {
                    if (isReadonly) return;
                    const newValues = e.target.checked
                      ? [...selectedValues, opt.value]
                      : selectedValues.filter((v: string) => v !== opt.value);
                    onChange?.(newValues);
                  }}
                  disabled={isReadonly}
                  className="cursor-pointer"
                />
                <span className="font-body text-body-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <label
            className={clsx(
              "flex items-center gap-gap-sm cursor-pointer",
              isReadonly && "cursor-not-allowed opacity-75"
            )}
          >
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange?.(e.target.checked)}
              onBlur={onBlur}
              disabled={isReadonly}
              className="w-5 h-5 cursor-pointer"
            />
            {field.helpText && (
              <span className="font-body text-body-sm text-text-secondary">{field.helpText}</span>
            )}
          </label>
        );

      case "formula":
        return (
          <div className={clsx(baseInputClass, "bg-surface-secondary flex items-center gap-gap-xs")}>
            <Calculator className="size-4 text-on-dark-disabled" />
            <span className="font-code text-mono-sm">{String(value ?? "—")}</span>
          </div>
        );

      case "reference":
        return (
          <div className="relative">
            <select
              value={String(value ?? "")}
              onChange={(e) => onChange?.(e.target.value)}
              onBlur={onBlur}
              disabled={isReadonly}
              className={baseInputClass}
              aria-invalid={!!error}
            >
              <option value="">{field.placeholder || `Select ${field.referenceEntity}...`}</option>
              {referenceResults.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {onReferenceSearch && (
              <input
                type="text"
                placeholder="Search..."
                onChange={(e) => handleReferenceSearch(e.target.value)}
                className={clsx(baseInputClass, "mt-spacing-1")}
              />
            )}
            {referenceSearching && (
              <Loader2 className="absolute right-spacing-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-on-dark-disabled" />
            )}
          </div>
        );

      case "rich_text":
        return (
          <textarea
            value={String(value ?? "")}
            onChange={(e) => onChange?.(e.target.value)}
            onBlur={onBlur}
            placeholder={field.placeholder}
            disabled={isReadonly}
            rows={4}
            className={clsx(baseInputClass, "resize-y min-h-spacing-24")}
            aria-invalid={!!error}
          />
        );

      default:
        return (
          <input
            type="text"
            value={String(value ?? "")}
            onChange={(e) => onChange?.(e.target.value)}
            onBlur={onBlur}
            placeholder={field.placeholder}
            disabled={isReadonly}
            className={baseInputClass}
            aria-invalid={!!error}
          />
        );
    }
  };

  return (
    <div className={clsx("space-y-spacing-1", className)}>
      {showLabel && field.type !== "checkbox" && (
        <label className="flex items-center gap-gap-xs font-code text-mono-sm tracking-wide uppercase text-on-dark-disabled">
          {fieldIcons[field.type]}
          <span>{field.label}</span>
          {field.required && <span className="text-error-500">*</span>}
          {permission === "readonly" && <Lock className="size-3 text-on-dark-muted" />}
          {pendingSync && (
            <span className="flex items-center gap-gap-xs text-warning-500">
              <Loader2 className="size-3 animate-spin" />
              <span className="text-mono-xs">Syncing...</span>
            </span>
          )}
        </label>
      )}

      {renderInput()}

      {error && (
        <p id={`${field.id}-error`} className="text-error-500 text-body-xs font-body">
          {error}
        </p>
      )}

      {field.helpText && field.type !== "checkbox" && !error && (
        <p className="text-on-dark-disabled text-body-xs font-body">{field.helpText}</p>
      )}
    </div>
  );
}

export interface CustomFieldGroupProps {
  fields: CustomFieldDefinition[];
  values: Record<string, unknown>;
  onChange?: (key: string, value: unknown) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  compact?: boolean;
  columns?: 1 | 2 | 3;
  className?: string;
  pendingSyncFields?: string[];
}

export function CustomFieldGroup({
  fields,
  values,
  onChange,
  errors = {},
  disabled = false,
  compact = false,
  columns = 1,
  className = "",
  pendingSyncFields = [],
}: CustomFieldGroupProps) {
  const gridClass =
    columns === 3
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      : columns === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1";

  return (
    <div className={clsx("grid gap-gap-md", gridClass, className)}>
      {fields.map((field) => (
        <CustomFieldRenderer
          key={field.id}
          field={field}
          value={values[field.key]}
          onChange={(val) => onChange?.(field.key, val)}
          error={errors[field.key]}
          disabled={disabled}
          compact={compact}
          pendingSync={pendingSyncFields.includes(field.key)}
        />
      ))}
    </div>
  );
}

export default CustomFieldRenderer;
