"use client";

import { useState, useCallback, useMemo } from "react";

export interface ValidationRule {
  validator: (value: unknown, formData: Record<string, unknown>) => boolean;
  message: string;
}

export interface FieldConfig {
  name: string;
  defaultValue?: unknown;
  required?: boolean;
  rules?: ValidationRule[];
}

export interface UseFormStateOptions<T extends Record<string, unknown>> {
  initialValues?: Partial<T>;
  fields?: FieldConfig[];
  onSubmit?: (data: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormStateReturn<T extends Record<string, unknown>> {
  // Values
  values: T;
  setValue: (name: keyof T, value: unknown) => void;
  setValues: (values: Partial<T>) => void;
  
  // Errors
  errors: Record<string, string>;
  setError: (name: string, error: string) => void;
  clearError: (name: string) => void;
  clearErrors: () => void;
  
  // Touched
  touched: Record<string, boolean>;
  setTouched: (name: string) => void;
  
  // Validation
  validate: () => boolean;
  validateField: (name: string) => boolean;
  isValid: boolean;
  
  // Form state
  isDirty: boolean;
  isSubmitting: boolean;
  
  // Handlers
  handleChange: (name: keyof T) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (name: keyof T) => () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  
  // Utilities
  reset: () => void;
  getFieldProps: (name: keyof T) => {
    value: unknown;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    error?: string;
  };
}

export function useFormState<T extends Record<string, unknown>>({
  initialValues = {} as Partial<T>,
  fields = [],
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormStateOptions<T>): UseFormStateReturn<T> {
  // Build initial state from fields config
  const defaultValues = useMemo(() => {
    const values: Record<string, unknown> = { ...initialValues };
    fields.forEach(field => {
      if (values[field.name] === undefined) {
        values[field.name] = field.defaultValue ?? "";
      }
    });
    return values as T;
  }, [initialValues, fields]);

  const [values, setValuesState] = useState<T>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouchedState] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialState] = useState(defaultValues);

  // Check if form is dirty
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialState);
  }, [values, initialState]);

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // Validate a single field
  const validateField = useCallback((name: string): boolean => {
    const field = fields.find(f => f.name === name);
    const value = values[name as keyof T];
    
    // Required validation
    if (field?.required) {
      if (value === "" || value === null || value === undefined) {
        setErrors(prev => ({ ...prev, [name]: `${name} is required` }));
        return false;
      }
    }
    
    // Custom rules
    if (field?.rules) {
      for (const rule of field.rules) {
        if (!rule.validator(value, values)) {
          setErrors(prev => ({ ...prev, [name]: rule.message }));
          return false;
        }
      }
    }
    
    // Clear error if valid
    setErrors(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    
    return true;
  }, [fields, values]);

  // Validate all fields
  const validate = useCallback((): boolean => {
    let isValid = true;
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      const value = values[field.name as keyof T];
      
      // Required validation
      if (field.required) {
        if (value === "" || value === null || value === undefined) {
          newErrors[field.name] = `${field.name} is required`;
          isValid = false;
          return;
        }
      }
      
      // Custom rules
      if (field.rules) {
        for (const rule of field.rules) {
          if (!rule.validator(value, values)) {
            newErrors[field.name] = rule.message;
            isValid = false;
            break;
          }
        }
      }
    });
    
    setErrors(newErrors);
    return isValid;
  }, [fields, values]);

  // Set single value
  const setValue = useCallback((name: keyof T, value: unknown) => {
    setValuesState(prev => ({ ...prev, [name]: value }));
    
    if (validateOnChange) {
      setTimeout(() => validateField(name as string), 0);
    } else {
      // Clear error when user starts typing
      setErrors(prev => {
        const next = { ...prev };
        delete next[name as string];
        return next;
      });
    }
  }, [validateOnChange, validateField]);

  // Set multiple values
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }));
  }, []);

  // Set error
  const setError = useCallback((name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  // Clear error
  const clearError = useCallback((name: string) => {
    setErrors(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Set touched
  const setTouched = useCallback((name: string) => {
    setTouchedState(prev => ({ ...prev, [name]: true }));
  }, []);

  // Handle change
  const handleChange = useCallback((name: keyof T) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = e.target;
      const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
      setValue(name, value);
    };
  }, [setValue]);

  // Handle blur
  const handleBlur = useCallback((name: keyof T) => {
    return () => {
      setTouched(name as string);
      if (validateOnBlur) {
        validateField(name as string);
      }
    };
  }, [setTouched, validateOnBlur, validateField]);

  // Handle submit
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit?.(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, onSubmit, values]);

  // Reset form
  const reset = useCallback(() => {
    setValuesState(defaultValues);
    setErrors({});
    setTouchedState({});
  }, [defaultValues]);

  // Get field props helper
  const getFieldProps = useCallback((name: keyof T) => {
    return {
      value: values[name],
      onChange: handleChange(name),
      onBlur: handleBlur(name),
      error: touched[name as string] ? errors[name as string] : undefined,
    };
  }, [values, handleChange, handleBlur, touched, errors]);

  return {
    values,
    setValue,
    setValues,
    errors,
    setError,
    clearError,
    clearErrors,
    touched,
    setTouched,
    validate,
    validateField,
    isValid,
    isDirty,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    getFieldProps,
  };
}

export default useFormState;
