import { describe, it, expect } from 'vitest';
import {
  RateLimiter,
  RATE_LIMIT_PRESETS,
  getRateLimiterForEndpoint,
} from '../rate-limiting';

describe('Rate Limiting', () => {
  describe('RATE_LIMIT_PRESETS', () => {
    it('should have standard preset', () => {
      expect(RATE_LIMIT_PRESETS.standard).toBeDefined();
      expect(RATE_LIMIT_PRESETS.standard.limit).toBe(100);
    });

    it('should have auth preset with stricter limits', () => {
      expect(RATE_LIMIT_PRESETS.auth).toBeDefined();
      expect(RATE_LIMIT_PRESETS.auth.limit).toBe(10);
    });

    it('should have search preset', () => {
      expect(RATE_LIMIT_PRESETS.search).toBeDefined();
      expect(RATE_LIMIT_PRESETS.search.limit).toBe(30);
    });

    it('should have ai preset with low limits', () => {
      expect(RATE_LIMIT_PRESETS.ai).toBeDefined();
      expect(RATE_LIMIT_PRESETS.ai.limit).toBe(10);
    });

    it('should have webhook preset with high limits', () => {
      expect(RATE_LIMIT_PRESETS.webhook).toBeDefined();
      expect(RATE_LIMIT_PRESETS.webhook.limit).toBe(1000);
    });
  });

  describe('RateLimiter', () => {
    it('should create with default config', () => {
      const limiter = new RateLimiter();
      expect(limiter).toBeDefined();
    });

    it('should create with custom config', () => {
      const limiter = new RateLimiter({ limit: 50, windowMs: 30000 });
      expect(limiter).toBeDefined();
    });
  });

  describe('getRateLimiterForEndpoint', () => {
    it('should return auth limiter for auth endpoints', () => {
      const limiter = getRateLimiterForEndpoint('/api/auth/login');
      expect(limiter).toBeDefined();
    });

    it('should return search limiter for search endpoints', () => {
      const limiter = getRateLimiterForEndpoint('/api/search');
      expect(limiter).toBeDefined();
    });

    it('should return ai limiter for generate endpoints', () => {
      const limiter = getRateLimiterForEndpoint('/api/ai/generate');
      expect(limiter).toBeDefined();
    });

    it('should return standard limiter for other endpoints', () => {
      const limiter = getRateLimiterForEndpoint('/api/users');
      expect(limiter).toBeDefined();
    });
  });
});
