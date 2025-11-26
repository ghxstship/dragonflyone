"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import clsx from "clsx";

export type FieldType = "text" | "email" | "password" | "number" | "textarea" | "select" | "checkbox" | "radio" | "date" | "datetime" | "file";

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: FormFieldOption[];
  hint?: string;
  defaultValue?: unknown;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    custom?: (value: unknown) => string | null;
  };
  colSpan?: 1 | 2;
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: FormFieldConfig[];
}

export interface RecordFormModalProps<T = Record<string, unknown>> {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  title?: string;
  record?: Partial<T>;
  fields?: FormFieldConfig[];
  steps?: FormStep[];
  onSubmit: (data: T) => Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  className?: string;
}

const sizeClasses = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

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
  const modalTitle = title || (mode === "create" ? "Create New Record" : "Edit Record");
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

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && !submitting) onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, submitting, onClose]);

  const validateField = useCallback((field: FormFieldConfig, value: unknown): string | null => {
    if (field.required && (value === "" || value === null || value === undefined)) {
      return `${field.label} is required`;
    }
    if (field.validation) {
      const v = field.validation;
      const strValue = String(value || "");
      if (v.pattern && !v.pattern.test(strValue)) return `Invalid ${field.label.toLowerCase()} format`;
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
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormFieldConfig) => {
    const value = formData[field.name];
    const error = errors[field.name];
    const baseInputClasses = clsx(
      "w-full px-4 py-3 font-body text-body-md bg-white border-2 outline-none transition-colors duration-fast",
      error ? "border-grey-700" : "border-black focus:border-grey-700"
    );

    return (
      <div key={field.name} className={field.colSpan === 2 ? "col-span-2" : "col-span-1"}>
        <label className="block mb-2 font-heading text-body-sm tracking-wider uppercase">
          {field.label}
          {field.required && <span className="ml-1 text-black">*</span>}
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
        ) : field.type === "checkbox" ? (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              disabled={field.disabled || submitting}
              className="w-[18px] h-[18px]"
            />
            <span className="font-body text-body-md">{field.placeholder}</span>
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
          <span className="block mt-1 font-code text-mono-xs text-grey-500">{field.hint}</span>
        )}
        {error && (
          <span className="block mt-1 font-code text-mono-xs text-grey-700 uppercase">{error}</span>
        )}
      </div>
    );
  };

  if (!open) return null;

  return (
    <div
      className={clsx("fixed inset-0 z-modal flex items-center justify-center p-4", className)}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/50" onClick={submitting ? undefined : onClose} />
      
      <div className={clsx("relative bg-white border-2 border-black shadow-hard-lg w-full max-h-[90vh] flex flex-col", sizeClasses[size])}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-black">
          <h2 className="font-heading text-h4-md tracking-wider uppercase">{modalTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className={clsx("p-2 bg-transparent border-none text-xl", submitting ? "cursor-not-allowed" : "cursor-pointer")}
          >
            ✕
          </button>
        </div>

        {/* Step indicator */}
        {isMultiStep && (
          <div className="flex px-6 py-4 border-b border-grey-200 gap-2">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex-1 flex items-center gap-2">
                <div
                  className={clsx(
                    "w-6 h-6 rounded-full flex items-center justify-center font-code text-mono-xs",
                    idx <= currentStep ? "bg-black text-white" : "bg-grey-200 text-grey-500"
                  )}
                >
                  {idx + 1}
                </div>
                <span
                  className={clsx(
                    "font-code text-mono-xs uppercase",
                    idx === currentStep ? "text-black" : "text-grey-500"
                  )}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 flex flex-col">
          <div className="grid grid-cols-2 gap-4 flex-1">
            {currentFields.map(renderField)}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t-2 border-grey-200">
          <div>
            {isMultiStep && currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                disabled={submitting}
                className="px-6 py-3 font-heading text-body-md tracking-wider uppercase bg-white text-black border-2 border-black cursor-pointer hover:bg-grey-100"
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
                "px-6 py-3 font-heading text-body-md tracking-wider uppercase bg-white text-black border-2 border-black",
                submitting ? "cursor-not-allowed" : "cursor-pointer hover:bg-grey-100"
              )}
            >
              {cancelLabel}
            </button>
            {isMultiStep && currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 font-heading text-body-md tracking-wider uppercase bg-black text-white border-2 border-black cursor-pointer hover:bg-grey-900"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting || loading}
                className={clsx(
                  "px-6 py-3 font-heading text-body-md tracking-wider uppercase bg-black text-white border-2 border-black flex items-center gap-2",
                  submitting ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:bg-grey-900"
                )}
              >
                {submitting && <span className="inline-block w-3.5 h-3.5 border-2 border-grey-500 border-t-white rounded-full animate-spin" />}
                {submitText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecordFormModal;
