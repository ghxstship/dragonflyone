/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import {
  signUpSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  magicLinkSchema,
  profileSetupSchema,
  organizationSetupSchema,
  roleSelectionSchema,
  preferencesSchema,
  getAuthErrorMessage,
} from '../auth-schemas';

describe('auth-schemas', () => {
  describe('signUpSchema', () => {
    it('should validate valid sign up data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
        agreeToTerms: true,
      };
      expect(() => signUpSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123',
        confirmPassword: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
        agreeToTerms: true,
      };
      expect(() => signUpSchema.parse(invalidData)).toThrow();
    });

    it('should reject weak password - too short', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Pass1',
        confirmPassword: 'Pass1',
        firstName: 'John',
        lastName: 'Doe',
        agreeToTerms: true,
      };
      expect(() => signUpSchema.parse(invalidData)).toThrow();
    });

    it('should reject password without uppercase', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        agreeToTerms: true,
      };
      expect(() => signUpSchema.parse(invalidData)).toThrow();
    });

    it('should reject password without number', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'PasswordABC',
        confirmPassword: 'PasswordABC',
        firstName: 'John',
        lastName: 'Doe',
        agreeToTerms: true,
      };
      expect(() => signUpSchema.parse(invalidData)).toThrow();
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password456',
        firstName: 'John',
        lastName: 'Doe',
        agreeToTerms: true,
      };
      expect(() => signUpSchema.parse(invalidData)).toThrow();
    });

    it('should reject when terms not agreed', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
        agreeToTerms: false,
      };
      expect(() => signUpSchema.parse(invalidData)).toThrow();
    });

    it('should accept optional invite code', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
        agreeToTerms: true,
        inviteCode: 'INVITE123',
      };
      expect(() => signUpSchema.parse(validData)).not.toThrow();
    });
  });

  describe('signInSchema', () => {
    it('should validate valid sign in data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'anypassword',
      };
      expect(() => signInSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password',
      };
      expect(() => signInSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };
      expect(() => signInSchema.parse(invalidData)).toThrow();
    });

    it('should accept optional rememberMe', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password',
        rememberMe: true,
      };
      expect(() => signInSchema.parse(validData)).not.toThrow();
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate valid email', () => {
      expect(() => forgotPasswordSchema.parse({ email: 'test@example.com' })).not.toThrow();
    });

    it('should reject invalid email', () => {
      expect(() => forgotPasswordSchema.parse({ email: 'invalid' })).toThrow();
    });
  });

  describe('resetPasswordSchema', () => {
    it('should validate valid reset data', () => {
      const validData = {
        password: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      };
      expect(() => resetPasswordSchema.parse(validData)).not.toThrow();
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        password: 'NewPassword123',
        confirmPassword: 'DifferentPassword123',
      };
      expect(() => resetPasswordSchema.parse(invalidData)).toThrow();
    });

    it('should accept optional token', () => {
      const validData = {
        password: 'NewPassword123',
        confirmPassword: 'NewPassword123',
        token: 'reset-token-123',
      };
      expect(() => resetPasswordSchema.parse(validData)).not.toThrow();
    });
  });

  describe('magicLinkSchema', () => {
    it('should validate valid email', () => {
      expect(() => magicLinkSchema.parse({ email: 'test@example.com' })).not.toThrow();
    });

    it('should reject invalid email', () => {
      expect(() => magicLinkSchema.parse({ email: 'invalid' })).toThrow();
    });
  });

  describe('profileSetupSchema', () => {
    it('should validate valid profile data', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
      };
      expect(() => profileSetupSchema.parse(validData)).not.toThrow();
    });

    it('should reject empty first name', () => {
      const invalidData = {
        firstName: '',
        lastName: 'Doe',
      };
      expect(() => profileSetupSchema.parse(invalidData)).toThrow();
    });

    it('should accept optional fields', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        displayName: 'Johnny',
        phone: '+1234567890',
        bio: 'A short bio',
        avatarUrl: 'https://example.com/avatar.jpg',
      };
      expect(() => profileSetupSchema.parse(validData)).not.toThrow();
    });

    it('should accept empty string for avatarUrl', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: '',
      };
      expect(() => profileSetupSchema.parse(validData)).not.toThrow();
    });
  });

  describe('organizationSetupSchema', () => {
    it('should validate valid organization data', () => {
      const validData = {
        organizationName: 'Test Company',
      };
      expect(() => organizationSetupSchema.parse(validData)).not.toThrow();
    });

    it('should reject empty organization name', () => {
      const invalidData = {
        organizationName: '',
      };
      expect(() => organizationSetupSchema.parse(invalidData)).toThrow();
    });

    it('should accept valid organization type', () => {
      const validData = {
        organizationName: 'Test Company',
        organizationType: 'production_company',
      };
      expect(() => organizationSetupSchema.parse(validData)).not.toThrow();
    });

    it('should accept valid team size', () => {
      const validData = {
        organizationName: 'Test Company',
        teamSize: '11-50',
      };
      expect(() => organizationSetupSchema.parse(validData)).not.toThrow();
    });
  });

  describe('roleSelectionSchema', () => {
    it('should validate valid role selection', () => {
      const validData = {
        primaryRole: 'producer',
      };
      expect(() => roleSelectionSchema.parse(validData)).not.toThrow();
    });

    it('should reject empty primary role', () => {
      const invalidData = {
        primaryRole: '',
      };
      expect(() => roleSelectionSchema.parse(invalidData)).toThrow();
    });

    it('should accept additional roles', () => {
      const validData = {
        primaryRole: 'producer',
        additionalRoles: ['director', 'writer'],
      };
      expect(() => roleSelectionSchema.parse(validData)).not.toThrow();
    });
  });

  describe('preferencesSchema', () => {
    it('should validate with defaults', () => {
      const result = preferencesSchema.parse({});
      expect(result.theme).toBe('system');
      expect(result.language).toBe('en');
      expect(result.emailNotifications).toBe(true);
    });

    it('should accept valid theme values', () => {
      expect(() => preferencesSchema.parse({ theme: 'light' })).not.toThrow();
      expect(() => preferencesSchema.parse({ theme: 'dark' })).not.toThrow();
      expect(() => preferencesSchema.parse({ theme: 'system' })).not.toThrow();
    });

    it('should reject invalid theme', () => {
      expect(() => preferencesSchema.parse({ theme: 'invalid' })).toThrow();
    });
  });

  describe('getAuthErrorMessage', () => {
    it('should return correct message for invalid_credentials', () => {
      expect(getAuthErrorMessage('invalid_credentials')).toBe('Invalid email or password');
    });

    it('should return correct message for email_exists', () => {
      expect(getAuthErrorMessage('email_exists')).toBe('An account with this email already exists');
    });

    it('should return correct message for expired_token', () => {
      expect(getAuthErrorMessage('expired_token')).toBe('Your session has expired. Please sign in again.');
    });

    it('should return correct message for rate_limited', () => {
      expect(getAuthErrorMessage('rate_limited')).toBe('Too many attempts. Please try again later.');
    });

    it('should return correct message for network_error', () => {
      expect(getAuthErrorMessage('network_error')).toBe('Network error. Please check your connection.');
    });

    it('should return correct message for permission_denied', () => {
      expect(getAuthErrorMessage('permission_denied')).toBe('You do not have permission to perform this action.');
    });

    it('should return correct message for weak_password', () => {
      expect(getAuthErrorMessage('weak_password')).toBe('Password does not meet security requirements.');
    });

    it('should return correct message for email_not_verified', () => {
      expect(getAuthErrorMessage('email_not_verified')).toBe('Please verify your email address to continue.');
    });

    it('should return fallback for unknown code', () => {
      expect(getAuthErrorMessage('unknown_code' as any)).toBe('An unexpected error occurred');
    });
  });
});
