import { describe, it, expect } from 'vitest';
import { formatters } from '../format.js';

describe('formatters', () => {
  describe('currency', () => {
    it('formats USD currency correctly', () => {
      expect(formatters.currency(1234.56)).toBe('$1,234.56');
    });

    it('formats zero correctly', () => {
      expect(formatters.currency(0)).toBe('$0.00');
    });

    it('formats negative amounts correctly', () => {
      expect(formatters.currency(-100)).toBe('-$100.00');
    });

    it('formats with different currency', () => {
      expect(formatters.currency(100, 'EUR')).toContain('100');
    });
  });

  describe('number', () => {
    it('formats number with no decimals', () => {
      expect(formatters.number(1234567)).toBe('1,234,567');
    });

    it('formats number with decimals', () => {
      expect(formatters.number(1234.5678, 2)).toBe('1,234.57');
    });

    it('formats zero', () => {
      expect(formatters.number(0)).toBe('0');
    });
  });

  describe('percentage', () => {
    it('formats percentage correctly', () => {
      expect(formatters.percentage(0.5)).toBe('50%');
    });

    it('formats percentage with decimals', () => {
      expect(formatters.percentage(0.3333, 2)).toBe('33.33%');
    });

    it('formats zero percentage', () => {
      expect(formatters.percentage(0)).toBe('0%');
    });

    it('formats 100% correctly', () => {
      expect(formatters.percentage(1)).toBe('100%');
    });
  });

  describe('date', () => {
    it('formats date in short format', () => {
      const date = new Date('2024-01-15');
      const result = formatters.date(date, 'short');
      expect(result).toContain('2024');
    });

    it('formats date in long format', () => {
      const date = new Date('2024-01-15');
      const result = formatters.date(date, 'long');
      expect(result).toContain('2024');
    });

    it('formats date in ISO format', () => {
      const date = new Date('2024-01-15T00:00:00.000Z');
      const result = formatters.date(date, 'iso');
      expect(result).toContain('2024-01-15');
    });

    it('handles string date input', () => {
      const result = formatters.date('2024-01-15', 'short');
      expect(result).toContain('2024');
    });
  });

  describe('datetime', () => {
    it('formats datetime correctly', () => {
      const date = new Date('2024-01-15T14:30:00');
      const result = formatters.datetime(date);
      expect(result).toContain('2024');
    });

    it('handles string datetime input', () => {
      const result = formatters.datetime('2024-01-15T14:30:00');
      expect(result).toContain('2024');
    });
  });

  describe('phone', () => {
    it('formats 10-digit phone number', () => {
      expect(formatters.phone('1234567890')).toBe('(123) 456-7890');
    });

    it('returns original for non-10-digit numbers', () => {
      expect(formatters.phone('12345')).toBe('12345');
    });

    it('strips non-numeric characters before formatting', () => {
      expect(formatters.phone('123-456-7890')).toBe('(123) 456-7890');
    });
  });

  describe('truncate', () => {
    it('truncates long text', () => {
      expect(formatters.truncate('Hello World', 5)).toBe('Hello...');
    });

    it('does not truncate short text', () => {
      expect(formatters.truncate('Hi', 10)).toBe('Hi');
    });

    it('uses custom suffix', () => {
      expect(formatters.truncate('Hello World', 5, '…')).toBe('Hello…');
    });
  });

  describe('capitalize', () => {
    it('capitalizes first letter', () => {
      expect(formatters.capitalize('hello')).toBe('Hello');
    });

    it('lowercases rest of string', () => {
      expect(formatters.capitalize('HELLO')).toBe('Hello');
    });

    it('handles single character', () => {
      expect(formatters.capitalize('h')).toBe('H');
    });
  });

  describe('titleCase', () => {
    it('converts to title case', () => {
      expect(formatters.titleCase('hello world')).toBe('Hello World');
    });

    it('handles mixed case input', () => {
      expect(formatters.titleCase('hELLO wORLD')).toBe('Hello World');
    });

    it('handles single word', () => {
      expect(formatters.titleCase('hello')).toBe('Hello');
    });
  });

  describe('fileSize', () => {
    it('formats bytes', () => {
      expect(formatters.fileSize(500)).toBe('500.0 B');
    });

    it('formats kilobytes', () => {
      expect(formatters.fileSize(1024)).toBe('1.0 KB');
    });

    it('formats megabytes', () => {
      expect(formatters.fileSize(1048576)).toBe('1.0 MB');
    });

    it('formats gigabytes', () => {
      expect(formatters.fileSize(1073741824)).toBe('1.0 GB');
    });
  });

  describe('pluralize', () => {
    it('returns singular for count of 1', () => {
      expect(formatters.pluralize(1, 'item')).toBe('item');
    });

    it('returns plural for count > 1', () => {
      expect(formatters.pluralize(2, 'item')).toBe('items');
    });

    it('returns plural for count of 0', () => {
      expect(formatters.pluralize(0, 'item')).toBe('items');
    });

    it('uses custom plural form', () => {
      expect(formatters.pluralize(2, 'person', 'people')).toBe('people');
    });
  });
});
