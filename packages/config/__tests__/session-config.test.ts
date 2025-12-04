import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  SessionManager,
  DEFAULT_SESSION_CONFIG,
  formatTimeRemaining,
  calculateSessionExpiry,
  getSupabaseSessionConfig,
} from '../session-config';

describe('Session Config', () => {
  describe('DEFAULT_SESSION_CONFIG', () => {
    it('should have 30 minute session timeout', () => {
      expect(DEFAULT_SESSION_CONFIG.sessionTimeout).toBe(30 * 60 * 1000);
    });

    it('should have 5 minute warning time', () => {
      expect(DEFAULT_SESSION_CONFIG.warningTime).toBe(5 * 60 * 1000);
    });

    it('should enable remember me by default', () => {
      expect(DEFAULT_SESSION_CONFIG.enableRememberMe).toBe(true);
    });

    it('should have 30 day remember me duration', () => {
      expect(DEFAULT_SESSION_CONFIG.rememberMeDuration).toBe(30 * 24 * 60 * 60 * 1000);
    });
  });

  describe('SessionManager', () => {
    let manager: SessionManager;

    beforeEach(() => {
      vi.useFakeTimers();
      manager = new SessionManager();
    });

    afterEach(() => {
      manager.stop();
      vi.useRealTimers();
    });

    it('should create with default config', () => {
      const state = manager.getState();
      expect(state.isActive).toBe(false);
    });

    it('should start session', () => {
      manager.start();
      const state = manager.getState();
      expect(state.isActive).toBe(true);
    });

    it('should track remember me state', () => {
      manager.start(true);
      const state = manager.getState();
      expect(state.rememberMe).toBe(true);
    });

    it('should stop session', () => {
      manager.start();
      manager.stop();
      const state = manager.getState();
      expect(state.isActive).toBe(false);
    });

    it('should detect expired session', () => {
      manager.start();
      vi.advanceTimersByTime(31 * 60 * 1000); // 31 minutes
      expect(manager.isExpired()).toBe(true);
    });
  });

  describe('formatTimeRemaining', () => {
    it('should format minutes and seconds', () => {
      expect(formatTimeRemaining(125000)).toBe('2m 5s');
    });

    it('should format seconds only', () => {
      expect(formatTimeRemaining(45000)).toBe('45s');
    });

    it('should handle zero', () => {
      expect(formatTimeRemaining(0)).toBe('0s');
    });
  });

  describe('calculateSessionExpiry', () => {
    it('should return session timeout for non-remember-me', () => {
      const expiry = calculateSessionExpiry(false);
      expect(expiry).toBe(30 * 60); // 30 minutes in seconds
    });

    it('should return remember me duration for remember-me', () => {
      const expiry = calculateSessionExpiry(true);
      expect(expiry).toBe(30 * 24 * 60 * 60); // 30 days in seconds
    });
  });

  describe('getSupabaseSessionConfig', () => {
    it('should return auto refresh token setting', () => {
      const config = getSupabaseSessionConfig();
      expect(config.autoRefreshToken).toBe(true);
    });

    it('should return persist session setting', () => {
      const config = getSupabaseSessionConfig();
      expect(config.persistSession).toBe(true);
    });

    it('should detect session in URL', () => {
      const config = getSupabaseSessionConfig();
      expect(config.detectSessionInUrl).toBe(true);
    });
  });
});
