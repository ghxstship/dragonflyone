import { describe, it, expect } from 'vitest';
import {
  type ProfileData,
  type PreferencesData,
} from '../useOnboarding';

describe('useOnboarding', () => {
  describe('ProfileData interface', () => {
    it('should have correct structure', () => {
      const profile: ProfileData = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1 555-123-4567',
        location: 'New York, NY',
      };

      expect(profile.firstName).toBe('John');
      expect(profile.lastName).toBe('Doe');
      expect(profile.phone).toBe('+1 555-123-4567');
      expect(profile.location).toBe('New York, NY');
    });

    it('should allow empty optional fields', () => {
      const profile: ProfileData = {
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '',
        location: '',
      };

      expect(profile.firstName).toBe('Jane');
      expect(profile.phone).toBe('');
      expect(profile.location).toBe('');
    });

    it('should support international phone formats', () => {
      const profile: ProfileData = {
        firstName: 'Test',
        lastName: 'User',
        phone: '+44 20 7946 0958',
        location: 'London, UK',
      };

      expect(profile.phone).toContain('+44');
    });
  });

  describe('PreferencesData interface', () => {
    it('should have correct structure', () => {
      const preferences: PreferencesData = {
        theme: 'dark',
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
      };

      expect(preferences.theme).toBe('dark');
      expect(preferences.emailNotifications).toBe(true);
      expect(preferences.pushNotifications).toBe(true);
      expect(preferences.marketingEmails).toBe(false);
    });

    it('should support light theme', () => {
      const preferences: PreferencesData = {
        theme: 'light',
        emailNotifications: true,
        pushNotifications: false,
        marketingEmails: true,
      };

      expect(preferences.theme).toBe('light');
    });

    it('should support all notifications disabled', () => {
      const preferences: PreferencesData = {
        theme: 'dark',
        emailNotifications: false,
        pushNotifications: false,
        marketingEmails: false,
      };

      expect(preferences.emailNotifications).toBe(false);
      expect(preferences.pushNotifications).toBe(false);
      expect(preferences.marketingEmails).toBe(false);
    });

    it('should support all notifications enabled', () => {
      const preferences: PreferencesData = {
        theme: 'dark',
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: true,
      };

      expect(preferences.emailNotifications).toBe(true);
      expect(preferences.pushNotifications).toBe(true);
      expect(preferences.marketingEmails).toBe(true);
    });
  });
});
