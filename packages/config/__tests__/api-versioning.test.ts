import { describe, it, expect } from 'vitest';
import {
  isVersionedPath,
  versionedPath,
  unversionedPath,
  getVersionFromPath,
  API_VERSION_CONFIG,
} from '../api-versioning';

describe('API Versioning', () => {
  describe('isVersionedPath', () => {
    it('should return true for versioned paths', () => {
      expect(isVersionedPath('/api/v1/users')).toBe(true);
      expect(isVersionedPath('/api/v2/projects')).toBe(true);
    });

    it('should return false for unversioned paths', () => {
      expect(isVersionedPath('/api/users')).toBe(false);
      expect(isVersionedPath('/dashboard')).toBe(false);
    });
  });

  describe('versionedPath', () => {
    it('should add version prefix to path', () => {
      expect(versionedPath('users', 'v1')).toBe('/api/v1/users');
    });

    it('should handle paths with leading slash', () => {
      expect(versionedPath('/projects', 'v2')).toBe('/api/v2/projects');
    });

    it('should not double-version already versioned paths', () => {
      expect(versionedPath('/api/v1/users', 'v1')).toBe('/api/v1/users');
    });
  });

  describe('unversionedPath', () => {
    it('should remove version prefix from path', () => {
      expect(unversionedPath('/api/v1/users')).toBe('/api/users');
    });

    it('should handle v2 prefix', () => {
      expect(unversionedPath('/api/v2/projects')).toBe('/api/projects');
    });

    it('should return path unchanged if no version prefix', () => {
      expect(unversionedPath('/api/users')).toBe('/api/users');
    });
  });

  describe('getVersionFromPath', () => {
    it('should extract v1 from path', () => {
      expect(getVersionFromPath('/api/v1/users')).toBe('v1');
    });

    it('should extract v2 from path', () => {
      expect(getVersionFromPath('/api/v2/users')).toBe('v2');
    });

    it('should return null for unversioned path', () => {
      expect(getVersionFromPath('/api/users')).toBe(null);
    });
  });

  describe('API_VERSION_CONFIG', () => {
    it('should have v1 as current version', () => {
      expect(API_VERSION_CONFIG.currentVersion).toBe('v1');
    });

    it('should have v1 as default version', () => {
      expect(API_VERSION_CONFIG.defaultVersion).toBe('v1');
    });

    it('should support v1', () => {
      expect(API_VERSION_CONFIG.supportedVersions).toContain('v1');
    });
  });
});
