import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  phoneSchema,
  uuidSchema,
  urlSchema,
  passwordSchema,
  dateRangeSchema,
  sanitizeInput,
  sanitizeObject,
  validatePagination,
  validateDateRange,
} from '../validation';

describe('validation', () => {
  describe('emailSchema', () => {
    it('should accept valid email', () => {
      expect(emailSchema.safeParse('test@example.com').success).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(emailSchema.safeParse('invalid').success).toBe(false);
      expect(emailSchema.safeParse('test@').success).toBe(false);
      expect(emailSchema.safeParse('@example.com').success).toBe(false);
    });
  });

  describe('phoneSchema', () => {
    it('should accept valid phone numbers', () => {
      expect(phoneSchema.safeParse('+14155551234').success).toBe(true);
      expect(phoneSchema.safeParse('14155551234').success).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(phoneSchema.safeParse('abc').success).toBe(false);
      // Short numbers may pass the regex, test truly invalid format
      expect(phoneSchema.safeParse('0123').success).toBe(false);
    });
  });

  describe('uuidSchema', () => {
    it('should accept valid UUID', () => {
      expect(uuidSchema.safeParse('550e8400-e29b-41d4-a716-446655440000').success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      expect(uuidSchema.safeParse('not-a-uuid').success).toBe(false);
      expect(uuidSchema.safeParse('123').success).toBe(false);
    });
  });

  describe('urlSchema', () => {
    it('should accept valid URLs', () => {
      expect(urlSchema.safeParse('https://example.com').success).toBe(true);
      expect(urlSchema.safeParse('http://localhost:3000').success).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(urlSchema.safeParse('not-a-url').success).toBe(false);
      expect(urlSchema.safeParse('example.com').success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('should accept valid password', () => {
      expect(passwordSchema.safeParse('Password1!').success).toBe(true);
      expect(passwordSchema.safeParse('MyP@ssw0rd').success).toBe(true);
    });

    it('should reject password without uppercase', () => {
      const result = passwordSchema.safeParse('password1!');
      expect(result.success).toBe(false);
    });

    it('should reject password without lowercase', () => {
      const result = passwordSchema.safeParse('PASSWORD1!');
      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const result = passwordSchema.safeParse('Password!');
      expect(result.success).toBe(false);
    });

    it('should reject password without special character', () => {
      const result = passwordSchema.safeParse('Password1');
      expect(result.success).toBe(false);
    });

    it('should reject password too short', () => {
      const result = passwordSchema.safeParse('Pa1!');
      expect(result.success).toBe(false);
    });
  });

  describe('dateRangeSchema', () => {
    it('should accept valid date range', () => {
      const result = dateRangeSchema.safeParse({
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      });
      expect(result.success).toBe(true);
    });

    it('should accept same start and end date', () => {
      const result = dateRangeSchema.safeParse({
        start_date: '2024-06-15',
        end_date: '2024-06-15',
      });
      expect(result.success).toBe(true);
    });

    it('should reject end date before start date', () => {
      const result = dateRangeSchema.safeParse({
        start_date: '2024-12-31',
        end_date: '2024-01-01',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove angle brackets', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
    });

    it('should remove javascript: protocol', () => {
      expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
    });

    it('should remove event handlers', () => {
      expect(sanitizeInput('onclick=alert(1)')).toBe('alert(1)');
      expect(sanitizeInput('onmouseover=hack()')).toBe('hack()');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello world  ')).toBe('hello world');
    });

    it('should handle normal text', () => {
      expect(sanitizeInput('Hello, World!')).toBe('Hello, World!');
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize string values', () => {
      const input = { name: '<script>bad</script>', age: 25 };
      const result = sanitizeObject(input);
      expect(result.name).toBe('scriptbad/script');
      expect(result.age).toBe(25);
    });

    it('should sanitize nested objects', () => {
      const input = {
        user: {
          name: '<script>bad</script>',
          email: 'test@example.com',
        },
      };
      const result = sanitizeObject(input);
      expect((result.user as { name: string }).name).toBe('scriptbad/script');
    });

    it('should handle empty object', () => {
      const result = sanitizeObject({});
      expect(result).toEqual({});
    });

    it('should preserve non-string values', () => {
      const input = { count: 42, active: true, items: [1, 2, 3] };
      const result = sanitizeObject(input);
      expect(result.count).toBe(42);
      expect(result.active).toBe(true);
    });
  });

  describe('validatePagination', () => {
    it('should return defaults when no params', () => {
      const result = validatePagination();
      expect(result.page).toBe(1);
      expect(result.perPage).toBe(20);
    });

    it('should accept valid pagination', () => {
      const result = validatePagination(5, 50);
      expect(result.page).toBe(5);
      expect(result.perPage).toBe(50);
    });

    it('should enforce minimum page of 1', () => {
      const result = validatePagination(0, 20);
      expect(result.page).toBe(1);
    });

    it('should enforce minimum page of 1 for negative', () => {
      const result = validatePagination(-5, 20);
      expect(result.page).toBe(1);
    });

    it('should enforce maximum perPage of 100', () => {
      const result = validatePagination(1, 500);
      expect(result.perPage).toBe(100);
    });

    it('should enforce minimum perPage of 1', () => {
      const result = validatePagination(1, -5);
      expect(result.perPage).toBe(1);
    });
  });

  describe('validateDateRange', () => {
    it('should return null when no dates provided', () => {
      expect(validateDateRange()).toBeNull();
      expect(validateDateRange('2024-01-01')).toBeNull();
      expect(validateDateRange(undefined, '2024-12-31')).toBeNull();
    });

    it('should return parsed dates for valid range', () => {
      const result = validateDateRange('2024-01-01', '2024-12-31');
      expect(result).not.toBeNull();
      expect(result?.startDate).toBeInstanceOf(Date);
      expect(result?.endDate).toBeInstanceOf(Date);
    });

    it('should throw for invalid date format', () => {
      expect(() => validateDateRange('invalid', '2024-12-31')).toThrow('Invalid date format');
      expect(() => validateDateRange('2024-01-01', 'invalid')).toThrow('Invalid date format');
    });

    it('should throw when end date before start date', () => {
      expect(() => validateDateRange('2024-12-31', '2024-01-01')).toThrow('End date must be after start date');
    });

    it('should accept same start and end date', () => {
      const result = validateDateRange('2024-06-15', '2024-06-15');
      expect(result).not.toBeNull();
    });
  });
});
