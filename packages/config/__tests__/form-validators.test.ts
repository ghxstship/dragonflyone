import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateNumber,
  validatePositiveNumber,
  validateUrl,
  validateDate,
  validateFutureDate,
  validateForm,
} from '../form-validators';

describe('form-validators', () => {
  describe('validateEmail', () => {
    it('should return true for valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should return true for valid phone numbers', () => {
      expect(validatePhone('1234567890')).toBe(true);
      expect(validatePhone('+1 234 567 8901')).toBe(true);
      expect(validatePhone('(123) 456-7890')).toBe(true);
      expect(validatePhone('123-456-7890')).toBe(true);
    });

    it('should return false for invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('abc')).toBe(false);
      expect(validatePhone('')).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('should return true for non-empty values', () => {
      expect(validateRequired('hello')).toBe(true);
      expect(validateRequired(123)).toBe(true);
      expect(validateRequired(0)).toBe(true);
      expect(validateRequired(false)).toBe(true);
      expect(validateRequired([])).toBe(true);
    });

    it('should return false for empty values', () => {
      expect(validateRequired('')).toBe(false);
      expect(validateRequired('   ')).toBe(false);
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
    });
  });

  describe('validateMinLength', () => {
    it('should return true when length meets minimum', () => {
      expect(validateMinLength('hello', 5)).toBe(true);
      expect(validateMinLength('hello world', 5)).toBe(true);
    });

    it('should return false when length is below minimum', () => {
      expect(validateMinLength('hi', 5)).toBe(false);
      expect(validateMinLength('', 1)).toBe(false);
    });
  });

  describe('validateMaxLength', () => {
    it('should return true when length is within maximum', () => {
      expect(validateMaxLength('hello', 10)).toBe(true);
      expect(validateMaxLength('hi', 5)).toBe(true);
    });

    it('should return false when length exceeds maximum', () => {
      expect(validateMaxLength('hello world', 5)).toBe(false);
    });
  });

  describe('validateNumber', () => {
    it('should return true for valid numbers', () => {
      expect(validateNumber(123)).toBe(true);
      expect(validateNumber('456')).toBe(true);
      expect(validateNumber(0)).toBe(true);
      expect(validateNumber('0')).toBe(true);
    });

    it('should return false for invalid numbers', () => {
      expect(validateNumber('abc')).toBe(false);
      expect(validateNumber(-1)).toBe(false);
      expect(validateNumber('-5')).toBe(false);
    });
  });

  describe('validatePositiveNumber', () => {
    it('should return true for positive numbers', () => {
      expect(validatePositiveNumber(1)).toBe(true);
      expect(validatePositiveNumber('100')).toBe(true);
      expect(validatePositiveNumber(0.5)).toBe(true);
    });

    it('should return false for zero or negative numbers', () => {
      expect(validatePositiveNumber(0)).toBe(false);
      expect(validatePositiveNumber(-1)).toBe(false);
      expect(validatePositiveNumber('0')).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('should return true for valid URLs', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://localhost:3000')).toBe(true);
      expect(validateUrl('https://sub.domain.com/path?query=1')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('example.com')).toBe(false);
      expect(validateUrl('')).toBe(false);
    });
  });

  describe('validateDate', () => {
    it('should return true for valid dates', () => {
      expect(validateDate('2024-01-15')).toBe(true);
      expect(validateDate('2024-12-31T23:59:59')).toBe(true);
      expect(validateDate('January 1, 2024')).toBe(true);
    });

    it('should return false for invalid dates', () => {
      expect(validateDate('not-a-date')).toBe(false);
      expect(validateDate('')).toBe(false);
    });
  });

  describe('validateFutureDate', () => {
    it('should return true for future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(validateFutureDate(futureDate.toISOString())).toBe(true);
    });

    it('should return false for past dates', () => {
      expect(validateFutureDate('2020-01-01')).toBe(false);
      expect(validateFutureDate('1999-12-31')).toBe(false);
    });
  });

  describe('validateForm', () => {
    it('should return valid for correct form data', () => {
      const result = validateForm({
        email: { value: 'test@example.com', type: 'email', required: true },
        name: { value: 'John Doe', required: true, minLength: 2 },
      });
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should return errors for missing required fields', () => {
      const result = validateForm({
        email: { value: '', type: 'email', required: true },
        name: { value: '', required: true },
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('This field is required');
      expect(result.errors.name).toBe('This field is required');
    });

    it('should validate email type', () => {
      const result = validateForm({
        email: { value: 'invalid-email', type: 'email', required: true },
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Invalid email address');
    });

    it('should validate phone type', () => {
      const result = validateForm({
        phone: { value: '123', type: 'phone', required: true },
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.phone).toBe('Invalid phone number');
    });

    it('should validate url type', () => {
      const result = validateForm({
        website: { value: 'not-a-url', type: 'url', required: true },
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.website).toBe('Invalid URL');
    });

    it('should validate number type', () => {
      const result = validateForm({
        amount: { value: 'abc', type: 'number', required: true },
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toBe('Must be a valid number');
    });

    it('should validate positiveNumber type', () => {
      const result = validateForm({
        quantity: { value: 0, type: 'positiveNumber', required: true },
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.quantity).toBe('Must be a positive number');
    });

    it('should validate minLength', () => {
      const result = validateForm({
        password: { value: 'abc', required: true, minLength: 8 },
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Minimum length is 8 characters');
    });

    it('should validate maxLength', () => {
      const result = validateForm({
        bio: { value: 'This is a very long bio text', maxLength: 10 },
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.bio).toBe('Maximum length is 10 characters');
    });

    it('should validate custom function', () => {
      const result = validateForm({
        code: {
          value: 'ABC',
          custom: (v) => v.startsWith('XYZ'),
          customMessage: 'Code must start with XYZ',
        },
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.code).toBe('Code must start with XYZ');
    });

    it('should skip validation for empty non-required fields', () => {
      const result = validateForm({
        optional: { value: '', type: 'email', required: false },
      });
      expect(result.isValid).toBe(true);
    });

    it('should validate date type', () => {
      const result = validateForm({
        startDate: { value: 'not-a-date', type: 'date', required: true },
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.startDate).toBe('Invalid date');
    });

    it('should validate futureDate type', () => {
      const result = validateForm({
        eventDate: { value: '2020-01-01', type: 'futureDate', required: true },
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.eventDate).toBe('Date must be in the future');
    });
  });
});
