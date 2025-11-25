"use client";

import React, { useState, useCallback, useEffect } from "react";
import { colors, typography, fontSizes, letterSpacing, transitions, borderWidths } from "../tokens.js";

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

const sizeClasses = { sm: "400px", md: "560px", lg: "720px", xl: "900px" };

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
  const currentFields = isMultiStep ? steps[currentStep]?.fields || [] : fields;
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
    const baseInputStyle: React.CSSProperties = {
      width: "100%",
      padding: "0.75rem 1rem",
      fontFamily: typography.body,
      fontSize: fontSizes.bodyMD,
      backgroundColor: colors.white,
      border: `${borderWidths.medium} solid ${error ? colors.grey700 : colors.black}`,
      outline: "none",
      transition: transitions.fast,
    };

    return (
      <div key={field.name} style={{ gridColumn: field.colSpan === 2 ? "span 2" : "span 1" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontFamily: typography.heading, fontSize: fontSizes.bodySM, letterSpacing: letterSpacing.wider, textTransform: "uppercase" }}>
          {field.label}
          {field.required && <span style={{ marginLeft: "0.25rem", color: colors.black }}>*</span>}
        </label>

        {field.type === "textarea" ? (
          <textarea
            value={String(value || "")}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            disabled={field.disabled || submitting}
            rows={4}
            style={{ ...baseInputStyle, resize: "vertical" }}
          />
        ) : field.type === "select" ? (
          <select
            value={String(value || "")}
            onChange={(e) => handleChange(field.name, e.target.value)}
            disabled={field.disabled || submitting}
            style={baseInputStyle}
          >
            <option value="">{field.placeholder || "Select..."}</option>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : field.type === "checkbox" ? (
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              disabled={field.disabled || submitting}
              style={{ width: "18px", height: "18px" }}
            />
            <span style={{ fontFamily: typography.body, fontSize: fontSizes.bodyMD }}>{field.placeholder}</span>
          </label>
        ) : (
          <input
            type={field.type}
            value={String(value || "")}
            onChange={(e) => handleChange(field.name, field.type === "number" ? Number(e.target.value) : e.target.value)}
            placeholder={field.placeholder}
            disabled={field.disabled || submitting}
            style={baseInputStyle}
          />
        )}

        {field.hint && !error && (
          <span style={{ display: "block", marginTop: "0.25rem", fontFamily: typography.mono, fontSize: fontSizes.monoXS, color: colors.grey500 }}>{field.hint}</span>
        )}
        {error && (
          <span style={{ display: "block", marginTop: "0.25rem", fontFamily: typography.mono, fontSize: fontSizes.monoXS, color: colors.grey700, textTransform: "uppercase" }}>{error}</span>
        )}
      </div>
    );
  };

  if (!open) return null;

  return (
    <div className={className} style={{ position: "fixed", inset: 0, zIndex: 1400, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} role="dialog" aria-modal="true">
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.5)" }} onClick={submitting ? undefined : onClose} />
      
      <div style={{ position: "relative", backgroundColor: colors.white, border: `${borderWidths.medium} solid ${colors.black}`, boxShadow: "8px 8px 0 0 #000000", width: "100%", maxWidth: sizeClasses[size], maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: `${borderWidths.medium} solid ${colors.black}` }}>
          <h2 style={{ fontFamily: typography.heading, fontSize: fontSizes.h4MD, letterSpacing: letterSpacing.wider, textTransform: "uppercase", margin: 0 }}>{modalTitle}</h2>
          <button type="button" onClick={onClose} disabled={submitting} style={{ padding: "0.5rem", backgroundColor: "transparent", border: "none", cursor: submitting ? "not-allowed" : "pointer", fontSize: "20px" }}>✕</button>
        </div>

        {/* Step indicator */}
        {isMultiStep && (
          <div style={{ display: "flex", padding: "1rem 1.5rem", borderBottom: `1px solid ${colors.grey200}`, gap: "0.5rem" }}>
            {steps.map((step, idx) => (
              <div key={step.id} style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{
                  width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  backgroundColor: idx <= currentStep ? colors.black : colors.grey200,
                  color: idx <= currentStep ? colors.white : colors.grey500,
                  fontFamily: typography.mono, fontSize: fontSizes.monoXS,
                }}>{idx + 1}</div>
                <span style={{ fontFamily: typography.mono, fontSize: fontSizes.monoXS, color: idx === currentStep ? colors.black : colors.grey500, textTransform: "uppercase" }}>{step.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflow: "auto", padding: "1.5rem", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", flex: 1 }}>
            {currentFields.map(renderField)}
          </div>
        </form>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem", borderTop: `${borderWidths.medium} solid ${colors.grey200}` }}>
          <div>
            {isMultiStep && currentStep > 0 && (
              <button type="button" onClick={handlePrev} disabled={submitting} style={{ padding: "0.75rem 1.5rem", fontFamily: typography.heading, fontSize: fontSizes.bodyMD, letterSpacing: letterSpacing.wider, textTransform: "uppercase", backgroundColor: colors.white, color: colors.black, border: `${borderWidths.medium} solid ${colors.black}`, cursor: "pointer" }}>
                Previous
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="button" onClick={onClose} disabled={submitting} style={{ padding: "0.75rem 1.5rem", fontFamily: typography.heading, fontSize: fontSizes.bodyMD, letterSpacing: letterSpacing.wider, textTransform: "uppercase", backgroundColor: colors.white, color: colors.black, border: `${borderWidths.medium} solid ${colors.black}`, cursor: submitting ? "not-allowed" : "pointer" }}>
              {cancelLabel}
            </button>
            {isMultiStep && currentStep < steps.length - 1 ? (
              <button type="button" onClick={handleNext} style={{ padding: "0.75rem 1.5rem", fontFamily: typography.heading, fontSize: fontSizes.bodyMD, letterSpacing: letterSpacing.wider, textTransform: "uppercase", backgroundColor: colors.black, color: colors.white, border: `${borderWidths.medium} solid ${colors.black}`, cursor: "pointer" }}>
                Next
              </button>
            ) : (
              <button type="submit" onClick={handleSubmit} disabled={submitting || loading} style={{ padding: "0.75rem 1.5rem", fontFamily: typography.heading, fontSize: fontSizes.bodyMD, letterSpacing: letterSpacing.wider, textTransform: "uppercase", backgroundColor: colors.black, color: colors.white, border: `${borderWidths.medium} solid ${colors.black}`, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {submitting && <span style={{ display: "inline-block", width: "14px", height: "14px", border: `2px solid ${colors.grey500}`, borderTopColor: colors.white, borderRadius: "50%", animation: "spin 1s linear infinite" }} />}
                {submitText}
              </button>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default RecordFormModal;
