export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^\+?[\d\s\-()]+$/;
export const urlRegex = /^https?:\/\/.+/;

export const validators = {
  email: (value: string): boolean => emailRegex.test(value),
  phone: (value: string): boolean => phoneRegex.test(value),
  url: (value: string): boolean => urlRegex.test(value),
  required: (value: string | number | boolean): boolean => {
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return !isNaN(value);
    return value !== undefined && value !== null;
  },
  minLength: (value: string, min: number): boolean => value.length >= min,
  maxLength: (value: string, max: number): boolean => value.length <= max,
  pattern: (value: string, pattern: RegExp): boolean => pattern.test(value),
  numeric: (value: string): boolean => /^\d+$/.test(value),
  alphanumeric: (value: string): boolean => /^[a-zA-Z0-9]+$/.test(value),
  password: (value: string): boolean => {
    return value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);
  },
};

export interface ValidationRule {
  validator: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateField(value: any, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = [];
  
  for (const rule of rules) {
    if (!rule.validator(value)) {
      errors.push(rule.message);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateForm(values: Record<string, any>, rules: Record<string, ValidationRule[]>): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    results[field] = validateField(values[field], fieldRules);
  }
  
  return results;
}
