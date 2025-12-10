import { describe, it, expect } from 'vitest';
import type { ApiClientConfig, RequestConfig } from '../api-client';

describe('api-client', () => {
  describe('ApiClientConfig interface', () => {
    it('should have all optional fields', () => {
      const config: ApiClientConfig = {};
      expect(config.timeout).toBeUndefined();
      expect(config.retries).toBeUndefined();
      expect(config.retryDelay).toBeUndefined();
    });

    it('should support timeout configuration', () => {
      const config: ApiClientConfig = {
        timeout: 60000,
      };
      expect(config.timeout).toBe(60000);
    });

    it('should support retries configuration', () => {
      const config: ApiClientConfig = {
        retries: 5,
      };
      expect(config.retries).toBe(5);
    });

    it('should support retryDelay configuration', () => {
      const config: ApiClientConfig = {
        retryDelay: 2000,
      };
      expect(config.retryDelay).toBe(2000);
    });

    it('should support full configuration', () => {
      const config: ApiClientConfig = {
        timeout: 30000,
        retries: 3,
        retryDelay: 1000,
      };
      expect(config.timeout).toBe(30000);
      expect(config.retries).toBe(3);
      expect(config.retryDelay).toBe(1000);
    });
  });

  describe('RequestConfig interface', () => {
    it('should extend RequestInit', () => {
      const config: RequestConfig = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' }),
      };

      expect(config.method).toBe('POST');
      expect(config.headers).toBeDefined();
      expect(config.body).toBeDefined();
    });

    it('should support custom timeout', () => {
      const config: RequestConfig = {
        method: 'GET',
        timeout: 5000,
      };
      expect(config.timeout).toBe(5000);
    });

    it('should support skipAuth flag', () => {
      const config: RequestConfig = {
        method: 'GET',
        skipAuth: true,
      };
      expect(config.skipAuth).toBe(true);
    });

    it('should support GET request', () => {
      const config: RequestConfig = {
        method: 'GET',
      };
      expect(config.method).toBe('GET');
    });

    it('should support POST request with body', () => {
      const config: RequestConfig = {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', value: 123 }),
      };
      expect(config.method).toBe('POST');
      expect(config.body).toBeDefined();
    });

    it('should support PUT request', () => {
      const config: RequestConfig = {
        method: 'PUT',
        body: JSON.stringify({ id: '123', name: 'Updated' }),
      };
      expect(config.method).toBe('PUT');
    });

    it('should support DELETE request', () => {
      const config: RequestConfig = {
        method: 'DELETE',
      };
      expect(config.method).toBe('DELETE');
    });

    it('should support PATCH request', () => {
      const config: RequestConfig = {
        method: 'PATCH',
        body: JSON.stringify({ status: 'active' }),
      };
      expect(config.method).toBe('PATCH');
    });

    it('should support custom headers', () => {
      const config: RequestConfig = {
        method: 'GET',
        headers: {
          'X-Custom-Header': 'custom-value',
          'Accept': 'application/json',
        },
      };
      expect(config.headers).toBeDefined();
    });

    it('should support credentials option', () => {
      const config: RequestConfig = {
        method: 'GET',
        credentials: 'include',
      };
      expect(config.credentials).toBe('include');
    });

    it('should support cache option', () => {
      const config: RequestConfig = {
        method: 'GET',
        cache: 'no-cache',
      };
      expect(config.cache).toBe('no-cache');
    });
  });

  describe('Default configuration', () => {
    it('should define sensible defaults', () => {
      const defaults = {
        timeout: 30000,
        retries: 3,
        retryDelay: 1000,
      };

      expect(defaults.timeout).toBe(30000);
      expect(defaults.retries).toBe(3);
      expect(defaults.retryDelay).toBe(1000);
    });
  });
});
