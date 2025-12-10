import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchWithAuth,
  buildQueryParams,
  handleApiError,
  debounce,
  formatCurrency,
  formatDate,
} from '../api-helpers';

describe('api-helpers', () => {
  describe('fetchWithAuth', () => {
    beforeEach(() => {
      vi.spyOn(global, 'fetch');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return data on successful response', async () => {
      const mockData = { id: 1, name: 'Test' };
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      } as Response);

      const result = await fetchWithAuth<typeof mockData>('/api/test');

      expect(result.data).toEqual(mockData);
      expect(result.status).toBe(200);
      expect(result.error).toBeUndefined();
    });

    it('should return error on non-ok response', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      const result = await fetchWithAuth('/api/test');

      expect(result.error).toBe('HTTP 404: Not Found');
      expect(result.status).toBe(404);
      expect(result.data).toBeUndefined();
    });

    it('should return error on network failure', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      const result = await fetchWithAuth('/api/test');

      expect(result.error).toBe('Network error');
      expect(result.status).toBe(500);
    });

    it('should include custom headers', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      } as Response);

      await fetchWithAuth('/api/test', {
        headers: { Authorization: 'Bearer token' },
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token',
        },
      });
    });
  });

  describe('buildQueryParams', () => {
    it('should build query string from params', () => {
      const result = buildQueryParams({ page: 1, limit: 10 });
      expect(result).toBe('?page=1&limit=10');
    });

    it('should return empty string for empty params', () => {
      const result = buildQueryParams({});
      expect(result).toBe('');
    });

    it('should skip undefined values', () => {
      const result = buildQueryParams({ page: 1, filter: undefined });
      expect(result).toBe('?page=1');
    });

    it('should skip null values', () => {
      const result = buildQueryParams({ page: 1, filter: null });
      expect(result).toBe('?page=1');
    });

    it('should skip empty string values', () => {
      const result = buildQueryParams({ page: 1, search: '' });
      expect(result).toBe('?page=1');
    });

    it('should convert non-string values to strings', () => {
      const result = buildQueryParams({ active: true, count: 5 });
      expect(result).toBe('?active=true&count=5');
    });
  });

  describe('handleApiError', () => {
    it('should return message from Error object', () => {
      const error = new Error('Something went wrong');
      expect(handleApiError(error)).toBe('Something went wrong');
    });

    it('should return string errors directly', () => {
      expect(handleApiError('Custom error')).toBe('Custom error');
    });

    it('should return default message for unknown errors', () => {
      expect(handleApiError({})).toBe('An unexpected error occurred');
      expect(handleApiError(null)).toBe('An unexpected error occurred');
      expect(handleApiError(123)).toBe('An unexpected error occurred');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should delay function execution', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should reset timer on subsequent calls', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      vi.advanceTimersByTime(50);
      debouncedFn();
      vi.advanceTimersByTime(50);
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to the function', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn('arg1', 'arg2');
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should only call function once for rapid calls', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();
      debouncedFn();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('formatCurrency', () => {
    it('should format USD currency by default', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should format with specified currency', () => {
      expect(formatCurrency(1234.56, 'EUR')).toMatch(/€|EUR/);
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle negative numbers', () => {
      expect(formatCurrency(-100)).toBe('-$100.00');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });
  });

  describe('formatDate', () => {
    it('should format date in short format by default', () => {
      // Use UTC date to avoid timezone issues
      const date = new Date(2024, 0, 15); // January 15, 2024
      const result = formatDate(date);
      expect(result).toMatch(/1\/15\/2024/);
    });

    it('should format date in long format', () => {
      const date = new Date(2024, 0, 15); // January 15, 2024
      const result = formatDate(date, 'long');
      expect(result).toMatch(/January 15, 2024/);
    });

    it('should accept string dates', () => {
      // Use ISO format with time to avoid timezone issues
      const result = formatDate('2024-06-20T12:00:00');
      expect(result).toMatch(/6\/20\/2024/);
    });

    it('should accept Date objects', () => {
      const date = new Date(2024, 11, 25); // December 25, 2024
      const result = formatDate(date);
      expect(result).toMatch(/12\/25\/2024/);
    });
  });
});
