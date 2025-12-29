import { describe, it, expect } from 'vitest';
import { validators, validateField, validateForm, emailRegex, phoneRegex, urlRegex } from '../validation.js';

describe('validators', () => {
  describe('email', () => {
    it('validates correct email', () => {
      expect(validators.email('test@example.com')).toBe(true);
    });

    it('rejects invalid email without @', () => {
      expect(validators.email('testexample.com')).toBe(false);
    });

    it('rejects invalid email without domain', () => {
      expect(validators.email('test@')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(validators.email('')).toBe(false);
    });
  });

  describe('phone', () => {
    it('validates phone with digits only', () => {
      expect(validators.phone('1234567890')).toBe(true);
    });

    it('validates phone with dashes', () => {
      expect(validators.phone('123-456-7890')).toBe(true);
    });

    it('validates phone with parentheses', () => {
      expect(validators.phone('(123) 456-7890')).toBe(true);
    });

    it('validates international format', () => {
      expect(validators.phone('+1 234 567 8900')).toBe(true);
    });

    it('rejects phone with letters', () => {
      expect(validators.phone('123-ABC-7890')).toBe(false);
    });
  });

  describe('url', () => {
    it('validates http URL', () => {
      expect(validators.url('http://example.com')).toBe(true);
    });

    it('validates https URL', () => {
      expect(validators.url('https://example.com')).toBe(true);
    });

    it('rejects URL without protocol', () => {
      expect(validators.url('example.com')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(validators.url('')).toBe(false);
    });
  });

  describe('required', () => {
    it('validates non-empty string', () => {
      expect(validators.required('hello')).toBe(true);
    });

    it('rejects empty string', () => {
      expect(validators.required('')).toBe(false);
    });

    it('rejects whitespace-only string', () => {
      expect(validators.required('   ')).toBe(false);
    });

    it('validates number', () => {
      expect(validators.required(123)).toBe(true);
    });

    it('validates zero', () => {
      expect(validators.required(0)).toBe(true);
    });

    it('rejects NaN', () => {
      expect(validators.required(NaN)).toBe(false);
    });

    it('validates boolean true', () => {
      expect(validators.required(true)).toBe(true);
    });

    it('validates boolean false', () => {
      expect(validators.required(false)).toBe(true);
    });
  });

  describe('minLength', () => {
    it('validates string meeting minimum', () => {
      expect(validators.minLength('hello', 3)).toBe(true);
    });

    it('validates string at exact minimum', () => {
      expect(validators.minLength('abc', 3)).toBe(true);
    });

    it('rejects string below minimum', () => {
      expect(validators.minLength('ab', 3)).toBe(false);
    });
  });

  describe('maxLength', () => {
    it('validates string within maximum', () => {
      expect(validators.maxLength('hi', 5)).toBe(true);
    });

    it('validates string at exact maximum', () => {
      expect(validators.maxLength('hello', 5)).toBe(true);
    });

    it('rejects string exceeding maximum', () => {
      expect(validators.maxLength('hello world', 5)).toBe(false);
    });
  });

  describe('pattern', () => {
    it('validates matching pattern', () => {
      expect(validators.pattern('ABC123', /^[A-Z]+\d+$/)).toBe(true);
    });

    it('rejects non-matching pattern', () => {
      expect(validators.pattern('abc123', /^[A-Z]+\d+$/)).toBe(false);
    });
  });

  describe('numeric', () => {
    it('validates numeric string', () => {
      expect(validators.numeric('12345')).toBe(true);
    });

    it('rejects string with letters', () => {
      expect(validators.numeric('123abc')).toBe(false);
    });

    it('rejects string with decimals', () => {
      expect(validators.numeric('12.34')).toBe(false);
    });
  });

  describe('alphanumeric', () => {
    it('validates alphanumeric string', () => {
      expect(validators.alphanumeric('abc123')).toBe(true);
    });

    it('rejects string with special characters', () => {
      expect(validators.alphanumeric('abc-123')).toBe(false);
    });

    it('rejects string with spaces', () => {
      expect(validators.alphanumeric('abc 123')).toBe(false);
    });
  });

  describe('password', () => {
    it('validates strong password', () => {
      expect(validators.password('Password1')).toBe(true);
    });

    it('rejects password too short', () => {
      expect(validators.password('Pass1')).toBe(false);
    });

    it('rejects password without uppercase', () => {
      expect(validators.password('password1')).toBe(false);
    });

    it('rejects password without lowercase', () => {
      expect(validators.password('PASSWORD1')).toBe(false);
    });

    it('rejects password without number', () => {
      expect(validators.password('Password')).toBe(false);
    });
  });
});

describe('validateField', () => {
  it('returns valid for passing all rules', () => {
    const rules = [
      { validator: (v: string) => v.length > 0, message: 'Required' },
      { validator: (v: string) => v.length >= 3, message: 'Min 3 chars' },
    ];
    const result = validateField('hello', rules);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns invalid with errors for failing rules', () => {
    const rules = [
      { validator: (v: string) => v.length > 0, message: 'Required' },
      { validator: (v: string) => v.length >= 10, message: 'Min 10 chars' },
    ];
    const result = validateField('hello', rules);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Min 10 chars');
  });

  it('collects all errors', () => {
    const rules = [
      { validator: () => false, message: 'Error 1' },
      { validator: () => false, message: 'Error 2' },
    ];
    const result = validateField('test', rules);
    expect(result.errors).toHaveLength(2);
  });
});

describe('validateForm', () => {
  it('validates all fields', () => {
    const values = { name: 'John', email: 'john@example.com' };
    const rules = {
      name: [{ validator: (v: unknown) => typeof v === 'string' && v.length > 0, message: 'Name required' }],
      email: [{ validator: (v: unknown) => typeof v === 'string' && v.includes('@'), message: 'Invalid email' }],
    };
    const results = validateForm(values, rules);
    expect(results.name.isValid).toBe(true);
    expect(results.email.isValid).toBe(true);
  });

  it('returns errors for invalid fields', () => {
    const values = { name: '', email: 'invalid' };
    const rules = {
      name: [{ validator: (v: unknown) => typeof v === 'string' && v.length > 0, message: 'Name required' }],
      email: [{ validator: (v: unknown) => typeof v === 'string' && v.includes('@'), message: 'Invalid email' }],
    };
    const results = validateForm(values, rules);
    expect(results.name.isValid).toBe(false);
    expect(results.email.isValid).toBe(false);
  });
});

describe('regex exports', () => {
  it('exports emailRegex', () => {
    expect(emailRegex.test('test@example.com')).toBe(true);
  });

  it('exports phoneRegex', () => {
    expect(phoneRegex.test('123-456-7890')).toBe(true);
  });

  it('exports urlRegex', () => {
    expect(urlRegex.test('https://example.com')).toBe(true);
  });
});
