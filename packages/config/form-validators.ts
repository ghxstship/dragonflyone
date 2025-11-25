/**
 * Form Validation Utilities
 * Common validation functions for forms across all platforms
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export function validateRequired(value: any): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

export function validateMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength;
}

export function validateMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}

export function validateNumber(value: any): boolean {
  return !isNaN(Number(value)) && Number(value) >= 0;
}

export function validatePositiveNumber(value: any): boolean {
  return !isNaN(Number(value)) && Number(value) > 0;
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateDate(date: string): boolean {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}

export function validateFutureDate(date: string): boolean {
  const dateObj = new Date(date);
  return dateObj > new Date();
}

export interface FormField {
  value: any;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  type?: 'email' | 'phone' | 'url' | 'number' | 'date' | 'futureDate' | 'positiveNumber';
  custom?: (value: any) => boolean;
  customMessage?: string;
}

export function validateForm(
  fields: Record<string, FormField>
): ValidationResult {
  const errors: Record<string, string> = {};

  Object.entries(fields).forEach(([fieldName, field]) => {
    const { value, required, minLength, maxLength, type, custom, customMessage } = field;

    // Required validation
    if (required && !validateRequired(value)) {
      errors[fieldName] = 'This field is required';
      return;
    }

    // Skip other validations if field is empty and not required
    if (!validateRequired(value) && !required) {
      return;
    }

    // Type-specific validations
    switch (type) {
      case 'email':
        if (!validateEmail(value)) {
          errors[fieldName] = 'Invalid email address';
        }
        break;
      case 'phone':
        if (!validatePhone(value)) {
          errors[fieldName] = 'Invalid phone number';
        }
        break;
      case 'url':
        if (!validateUrl(value)) {
          errors[fieldName] = 'Invalid URL';
        }
        break;
      case 'number':
        if (!validateNumber(value)) {
          errors[fieldName] = 'Must be a valid number';
        }
        break;
      case 'positiveNumber':
        if (!validatePositiveNumber(value)) {
          errors[fieldName] = 'Must be a positive number';
        }
        break;
      case 'date':
        if (!validateDate(value)) {
          errors[fieldName] = 'Invalid date';
        }
        break;
      case 'futureDate':
        if (!validateFutureDate(value)) {
          errors[fieldName] = 'Date must be in the future';
        }
        break;
    }

    // Length validations
    if (typeof value === 'string') {
      if (minLength && !validateMinLength(value, minLength)) {
        errors[fieldName] = `Minimum length is ${minLength} characters`;
      }
      if (maxLength && !validateMaxLength(value, maxLength)) {
        errors[fieldName] = `Maximum length is ${maxLength} characters`;
      }
    }

    // Custom validation
    if (custom && !custom(value)) {
      errors[fieldName] = customMessage || 'Invalid value';
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
