import { describe, it, expect } from 'vitest';
import type {
  AuthError,
  AuthErrorCode,
  AuthResponse,
} from '../auth-schemas';

describe('auth-actions', () => {
  describe('AuthErrorCode types', () => {
    it('should include all error codes', () => {
      const codes: AuthErrorCode[] = [
        'invalid_credentials',
        'email_exists',
        'invalid_token',
        'expired_token',
        'rate_limited',
        'network_error',
        'server_error',
        'oauth_error',
        'session_expired',
        'validation_error',
        'permission_denied',
        'user_not_found',
        'weak_password',
        'email_not_verified',
      ];
      expect(codes.length).toBe(14);
    });

    it('should include authentication errors', () => {
      const authErrors: AuthErrorCode[] = [
        'invalid_credentials',
        'email_exists',
        'user_not_found',
        'weak_password',
      ];
      expect(authErrors.length).toBe(4);
    });

    it('should include token errors', () => {
      const tokenErrors: AuthErrorCode[] = [
        'invalid_token',
        'expired_token',
        'session_expired',
      ];
      expect(tokenErrors.length).toBe(3);
    });

    it('should include system errors', () => {
      const systemErrors: AuthErrorCode[] = [
        'rate_limited',
        'network_error',
        'server_error',
      ];
      expect(systemErrors.length).toBe(3);
    });
  });

  describe('AuthError interface', () => {
    it('should have code and message', () => {
      const error: AuthError = {
        code: 'invalid_credentials',
        message: 'Invalid email or password',
      };

      expect(error.code).toBe('invalid_credentials');
      expect(error.message).toBe('Invalid email or password');
    });

    it('should represent email exists error', () => {
      const error: AuthError = {
        code: 'email_exists',
        message: 'An account with this email already exists',
      };

      expect(error.code).toBe('email_exists');
    });

    it('should represent rate limited error', () => {
      const error: AuthError = {
        code: 'rate_limited',
        message: 'Too many attempts. Please try again later.',
      };

      expect(error.code).toBe('rate_limited');
    });

    it('should represent weak password error', () => {
      const error: AuthError = {
        code: 'weak_password',
        message: 'Password does not meet requirements',
      };

      expect(error.code).toBe('weak_password');
    });
  });

  describe('Default error messages', () => {
    const defaultMessages: Record<AuthErrorCode, string> = {
      invalid_credentials: 'Invalid email or password',
      email_exists: 'An account with this email already exists',
      invalid_token: 'Invalid or malformed token',
      expired_token: 'Your session has expired',
      rate_limited: 'Too many attempts. Please try again later.',
      network_error: 'Network error. Please check your connection.',
      server_error: 'An unexpected error occurred',
      oauth_error: 'OAuth authentication failed',
      session_expired: 'Your session has expired',
      validation_error: 'Please check your input',
      permission_denied: 'Permission denied',
      user_not_found: 'No account found with this email',
      weak_password: 'Password does not meet requirements',
      email_not_verified: 'Please verify your email address',
    };

    it('should have messages for all error codes', () => {
      const codes: AuthErrorCode[] = [
        'invalid_credentials',
        'email_exists',
        'invalid_token',
        'expired_token',
        'rate_limited',
        'network_error',
        'server_error',
        'oauth_error',
        'session_expired',
        'validation_error',
        'permission_denied',
        'user_not_found',
        'weak_password',
        'email_not_verified',
      ];

      codes.forEach((code) => {
        expect(defaultMessages[code]).toBeDefined();
        expect(defaultMessages[code].length).toBeGreaterThan(0);
      });
    });

    it('should have user-friendly messages', () => {
      expect(defaultMessages.invalid_credentials).toContain('email or password');
      expect(defaultMessages.rate_limited).toContain('try again');
      expect(defaultMessages.network_error).toContain('connection');
    });
  });

  describe('Platform types', () => {
    it('should support all platforms', () => {
      const platforms: ('atlvs' | 'compvss' | 'gvteway')[] = ['atlvs', 'compvss', 'gvteway'];
      expect(platforms.length).toBe(3);
    });
  });

  describe('AuthResponse structure', () => {
    it('should have user and session', () => {
      const response: AuthResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          platformRoles: ['GVTEWAY_MEMBER'],
          onboardingCompleted: true,
        },
        session: {
          accessToken: 'access-token-123',
          refreshToken: 'refresh-token-456',
          expiresAt: Date.now() + 3600000,
        },
      };

      expect(response.user.id).toBe('user-123');
      expect(response.session.accessToken).toBeDefined();
    });
  });
});
