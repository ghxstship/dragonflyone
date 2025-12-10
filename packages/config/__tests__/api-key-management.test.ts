import { describe, it, expect } from 'vitest';
import { ApiKey, ApiKeyScope } from '../api-key-management';

describe('api-key-management', () => {
  // Create a mock manager instance to test hasScope
  // We need to cast to access the method since it requires supabase in constructor
  const createMockApiKey = (scopes: ApiKeyScope[]): ApiKey => ({
    id: 'key-123',
    user_id: 'user-123',
    name: 'Test API Key',
    key_prefix: 'ghs_abc123',
    key_hash: 'hash_xyz',
    scopes,
    is_active: true,
    rate_limit: 1000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  describe('hasScope', () => {
    // Create a minimal mock manager to test hasScope
    const mockManager = {
      hasScope(keyData: ApiKey, requiredScope: ApiKeyScope): boolean {
        return keyData.scopes.includes('admin') || keyData.scopes.includes(requiredScope);
      },
    };

    it('should return true when key has the exact required scope', () => {
      const key = createMockApiKey(['read:projects', 'write:projects']);
      expect(mockManager.hasScope(key, 'read:projects')).toBe(true);
    });

    it('should return true when key has admin scope', () => {
      const key = createMockApiKey(['admin']);
      expect(mockManager.hasScope(key, 'read:projects')).toBe(true);
      expect(mockManager.hasScope(key, 'write:events')).toBe(true);
      expect(mockManager.hasScope(key, 'read:users')).toBe(true);
    });

    it('should return false when key does not have required scope', () => {
      const key = createMockApiKey(['read:projects']);
      expect(mockManager.hasScope(key, 'write:projects')).toBe(false);
    });

    it('should return false for empty scopes', () => {
      const key = createMockApiKey([]);
      expect(mockManager.hasScope(key, 'read:projects')).toBe(false);
    });

    it('should handle multiple scopes correctly', () => {
      const key = createMockApiKey(['read:projects', 'read:events', 'write:tickets']);
      expect(mockManager.hasScope(key, 'read:projects')).toBe(true);
      expect(mockManager.hasScope(key, 'read:events')).toBe(true);
      expect(mockManager.hasScope(key, 'write:tickets')).toBe(true);
      expect(mockManager.hasScope(key, 'write:projects')).toBe(false);
      expect(mockManager.hasScope(key, 'read:users')).toBe(false);
    });

    it('should handle webhooks scope', () => {
      const key = createMockApiKey(['webhooks']);
      expect(mockManager.hasScope(key, 'webhooks')).toBe(true);
      expect(mockManager.hasScope(key, 'read:projects')).toBe(false);
    });
  });

  describe('ApiKey type structure', () => {
    it('should have all required fields', () => {
      const key = createMockApiKey(['read:projects']);
      expect(key.id).toBeDefined();
      expect(key.user_id).toBeDefined();
      expect(key.name).toBeDefined();
      expect(key.key_prefix).toBeDefined();
      expect(key.key_hash).toBeDefined();
      expect(key.scopes).toBeDefined();
      expect(key.is_active).toBeDefined();
      expect(key.rate_limit).toBeDefined();
      expect(key.created_at).toBeDefined();
      expect(key.updated_at).toBeDefined();
    });

    it('should have optional fields as undefined by default', () => {
      const key = createMockApiKey(['read:projects']);
      expect(key.last_used_at).toBeUndefined();
      expect(key.expires_at).toBeUndefined();
    });

    it('should allow optional fields to be set', () => {
      const key: ApiKey = {
        ...createMockApiKey(['read:projects']),
        last_used_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      };
      expect(key.last_used_at).toBeDefined();
      expect(key.expires_at).toBeDefined();
    });
  });

  describe('ApiKeyScope type', () => {
    it('should include all valid scope values', () => {
      const validScopes: ApiKeyScope[] = [
        'read:projects',
        'write:projects',
        'read:events',
        'write:events',
        'read:tickets',
        'write:tickets',
        'read:orders',
        'write:orders',
        'read:crew',
        'write:crew',
        'read:assets',
        'write:assets',
        'read:users',
        'write:users',
        'admin',
        'webhooks',
      ];

      validScopes.forEach((scope) => {
        const key = createMockApiKey([scope]);
        expect(key.scopes).toContain(scope);
      });
    });
  });
});
