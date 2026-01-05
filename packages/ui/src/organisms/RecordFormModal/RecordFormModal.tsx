"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import clsx from "clsx";
import { Modal } from "../Modal/index.js";
import type { RecordFormModalProps, FormFieldConfig } from "./RecordFormModal.types.js";

/**
 * RecordFormModal component - Bold Contemporary Pop Art Adventure
 * 
 * Built on Modal for consistent accessibility and behavior:
 * - Focus trap
 * - Escape key handling
 * - Body scroll prevention
 * - ARIA attributes
 * 
 * Features:
 * - Single-step and multi-step (wizard) forms
 * - Various field types
 * - Client-side validation
 * - Loading/submitting states
 */
export function RecordFormModal<T = Record<string, unknown>>({
  open,
  onClose,
  mode,
  title,
  record,
  fields = [],
  steps = [],
  onSubmit,
  submitLabel,
  cancelLabel = "Cancel",
  size = "md",
  loading = false,
  className = "",
}: RecordFormModalProps<T>) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const isMultiStep = steps.length > 0;
  const currentFields = useMemo(() => 
    isMultiStep ? steps[currentStep]?.fields || [] : fields,
    [isMultiStep, steps, currentStep, fields]
  );
  const _modalTitle = title || (mode === "create" ? "Create New Record" : "Edit Record");
  const submitText = submitLabel || (mode === "create" ? "Create" : "Save Changes");

  // Initialize form data
  useEffect(() => {
    if (open) {
      const initialData: Record<string, unknown> = {};
      const allFields = isMultiStep ? steps.flatMap(s => s.fields) : fields;
      allFields.forEach(field => {
        initialData[field.name] = record?.[field.name as keyof typeof record] ?? field.defaultValue ?? "";
      });
      setFormData(initialData);
      setErrors({});
      setCurrentStep(0);
    }
  }, [open, record, fields, steps, isMultiStep]);

  const validateField = useCallback((field: FormFieldConfig, value: unknown): string | null => {
    if (field.required && (value === "" || value === null || value === undefined)) {
      return `${field.label} is required`;
    }
    if (field.validation) {
      const v = field.validation;
      const strValue = String(value || "");
      if (v.pattern) {
        const regex = typeof v.pattern === 'string' ? new RegExp(v.pattern) : v.pattern;
        if (!regex.test(strValue)) return v.patternMessage || `Invalid ${field.label.toLowerCase()} format`;
      }
      if (v.minLength && strValue.length < v.minLength) return `${field.label} must be at least ${v.minLength} characters`;
      if (v.maxLength && strValue.length > v.maxLength) return `${field.label} must be at most ${v.maxLength} characters`;
      if (v.min !== undefined && Number(value) < v.min) return `${field.label} must be at least ${v.min}`;
      if (v.max !== undefined && Number(value) > v.max) return `${field.label} must be at most ${v.max}`;
      if (v.custom) {
        const customError = v.custom(value);
        if (customError) return customError;
      }
    }
    return null;
  }, []);

  const validateCurrentStep = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    currentFields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) newErrors[field.name] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentFields, formData, validateField]);

  const handleChange = (name: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    setSubmitting(true);
    try {
      await onSubmit(formData as T);
      onClose();
    } catch (err) {
      setErrors(prev => ({ ...prev, _form: err instanceof Error ? err.message : "Form submission failed" }));
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormFieldConfig) => {
    const value = formData[field.name];
    const error = errors[field.name];
    const baseInputClasses = clsx(
      "w-full border-2 bg-surface-elevated px-4 py-3 font-body text-base text-text-primary outline-none transition-colors duration-100",
      error ? "border-error" : "border-border hover:border-border focus:border-primary-500"
    );

    return (
      <div key={field.name} className={field.colSpan === 2 ? "col-span-2" : "col-span-1"}>
        <label className="block mb-2 font-heading text-sm tracking-wider uppercase">
          {field.label}
          {field.required && <span className="ml-1 text-error">*</span>}
        </label>

        {field.type === "textarea" ? (
          <textarea
            value={String(value || "")}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            disabled={field.disabled || submitting}
            rows={4}
            className={clsx(baseInputClasses, "resize-y")}
          />
        ) : field.type === "select" ? (
          <select
            value={String(value || "")}
            onChange={(e) => handleChange(field.name, e.target.value)}
            disabled={field.disabled || submitting}
            className={baseInputClasses}
          >
            <option value="">{field.placeholder || "Select..."}</option>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : field.type === "multiselect" ? (
          <select
            multiple
            value={Array.isArray(value) ? value : []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              handleChange(field.name, selected);
            }}
            disabled={field.disabled || submitting}
            className={clsx(baseInputClasses, "min-h-[100px]")}
          >
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : field.type === "checkbox" ? (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              disabled={field.disabled || submitting}
              className="w-4 h-4"
            />
            <span className="font-body text-base">{field.placeholder}</span>
          </label>
        ) : (
          <input
            type={field.type}
            value={String(value || "")}
            onChange={(e) => handleChange(field.name, field.type === "number" ? Number(e.target.value) : e.target.value)}
            placeholder={field.placeholder}
            disabled={field.disabled || submitting}
            className={baseInputClasses}
          />
        )}

        {field.hint && !error && (
          <span className="block mt-1 font-mono text-xs text-text-muted">{field.hint}</span>
        )}
        {error && (
          <span className="block mt-1 font-mono text-xs text-error uppercase">{error}</span>
        )}
      </div>
    );
  };

  // Step indicator header content for multi-step forms
  const stepIndicatorContent = isMultiStep ? (
    <div className="flex px-6 py-4 border-b-2 border-border gap-2">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex-1 flex items-center gap-2">
          <div
            className={clsx(
              "w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs",
              idx <= currentStep ? "bg-surface-inverse text-text-primary" : "bg-muted text-text-muted"
            )}
          >
            {idx + 1}
          </div>
          <span
            className={clsx(
              "font-mono text-xs uppercase",
              idx === currentStep ? "text-text-primary" : "text-text-muted"
            )}
          >
            {step.title}
          </span>
        </div>
      ))}
    </div>
  ) : null;

  // Footer content with navigation and submit buttons
  const _footerContent = (
    <div className="flex items-center justify-between">
      <div>
        {isMultiStep && currentStep > 0 && (
          <button
            type="button"
            onClick={handlePrev}
            disabled={submitting}
            className="px-6 py-3 font-heading text-base tracking-wider uppercase leading-none bg-surface-primary text-text-primary border-2 border-border cursor-pointer hover:bg-muted disabled:opacity-50"
          >
            Previous
          </button>
        )}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className={clsx(
            "px-6 py-3 font-heading text-base tracking-wider uppercase leading-none bg-surface-primary text-text-primary border-2 border-border",
            submitting ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-muted"
          )}
        >
          {cancelLabel}
        </button>
        {isMultiStep && currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-3 font-heading text-base tracking-wider uppercase leading-none bg-surface-inverse text-text-primary border-2 border-border cursor-pointer hover:bg-surface-elevated"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            form="record-form"
            disabled={submitting || loading}
            className={clsx(
              "px-6 py-3 font-heading text-base tracking-wider uppercase leading-none bg-surface-inverse text-text-primary border-2 border-border flex items-center gap-2",
              submitting || loading ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:bg-surface-elevated"
            )}
          >
            {submitting && <span className="inline-block w-3 h-3 border-2 border-border border-t-on-dark-primary rounded-full animate-spin" />}
            {submitText}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      size={size}
      open={open}
      onClose={onClose}
      showClose={!submitting}
      className={className}
    >
      {/* Form-level error */}
      {errors._form && (
        <div className="mb-4 p-3 bg-error/10 border-2 border-error/20 rounded-card">
          <p className="text-sm text-error">{errors._form}</p>
        </div>
      )}

      {/* Step indicator */}
      {stepIndicatorContent}

      {/* Form */}
      <form id="record-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          {currentFields.map(renderField)}
        </div>
      </form>
    </Modal>
  );
}

export default RecordFormModal;
