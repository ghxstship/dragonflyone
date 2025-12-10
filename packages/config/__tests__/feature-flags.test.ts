import { describe, it, expect } from 'vitest';
import type {
  FeatureFlag,
  FlagEvaluation,
  FlagOverride,
  FlagType,
  FlagStatus,
  RolloutStrategy,
} from '../feature-flags';

describe('feature-flags', () => {
  describe('FlagType', () => {
    it('should support all flag types', () => {
      const types: FlagType[] = ['boolean', 'string', 'number', 'json'];
      expect(types.length).toBe(4);
    });
  });

  describe('FlagStatus', () => {
    it('should support all flag statuses', () => {
      const statuses: FlagStatus[] = ['active', 'inactive', 'archived'];
      expect(statuses.length).toBe(3);
    });
  });

  describe('RolloutStrategy', () => {
    it('should support all rollout strategies', () => {
      const strategies: RolloutStrategy[] = ['all', 'percentage', 'users', 'roles', 'custom'];
      expect(strategies.length).toBe(5);
    });
  });

  describe('FeatureFlag interface', () => {
    it('should have all required fields', () => {
      const flag: FeatureFlag = {
        id: 'flag-123',
        key: 'new_dashboard',
        name: 'New Dashboard',
        description: 'Enable the new dashboard UI',
        type: 'boolean',
        default_value: false,
        status: 'active',
        rollout_strategy: 'percentage',
        rollout_percentage: 50,
        created_by: 'user-123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(flag.id).toBe('flag-123');
      expect(flag.key).toBe('new_dashboard');
      expect(flag.name).toBe('New Dashboard');
      expect(flag.type).toBe('boolean');
      expect(flag.status).toBe('active');
      expect(flag.rollout_strategy).toBe('percentage');
      expect(flag.rollout_percentage).toBe(50);
    });

    it('should support boolean flag type', () => {
      const flag: FeatureFlag = {
        id: 'flag-1',
        key: 'dark_mode',
        name: 'Dark Mode',
        type: 'boolean',
        default_value: true,
        status: 'active',
        rollout_strategy: 'all',
        created_by: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(flag.type).toBe('boolean');
      expect(typeof flag.default_value).toBe('boolean');
    });

    it('should support string flag type', () => {
      const flag: FeatureFlag = {
        id: 'flag-2',
        key: 'theme_color',
        name: 'Theme Color',
        type: 'string',
        default_value: 'blue',
        status: 'active',
        rollout_strategy: 'all',
        created_by: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(flag.type).toBe('string');
      expect(typeof flag.default_value).toBe('string');
    });

    it('should support number flag type', () => {
      const flag: FeatureFlag = {
        id: 'flag-3',
        key: 'max_items',
        name: 'Max Items',
        type: 'number',
        default_value: 100,
        status: 'active',
        rollout_strategy: 'all',
        created_by: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(flag.type).toBe('number');
      expect(typeof flag.default_value).toBe('number');
    });

    it('should support json flag type', () => {
      const flag: FeatureFlag = {
        id: 'flag-4',
        key: 'config',
        name: 'Configuration',
        type: 'json',
        default_value: { enabled: true, limit: 50 },
        status: 'active',
        rollout_strategy: 'all',
        created_by: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(flag.type).toBe('json');
      expect(typeof flag.default_value).toBe('object');
    });

    it('should support user-based rollout', () => {
      const flag: FeatureFlag = {
        id: 'flag-5',
        key: 'beta_feature',
        name: 'Beta Feature',
        type: 'boolean',
        default_value: false,
        status: 'active',
        rollout_strategy: 'users',
        allowed_users: ['user-1', 'user-2', 'user-3'],
        created_by: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(flag.rollout_strategy).toBe('users');
      expect(flag.allowed_users?.length).toBe(3);
    });

    it('should support role-based rollout', () => {
      const flag: FeatureFlag = {
        id: 'flag-6',
        key: 'admin_feature',
        name: 'Admin Feature',
        type: 'boolean',
        default_value: false,
        status: 'active',
        rollout_strategy: 'roles',
        allowed_roles: ['LEGEND_ADMIN', 'ATLVS_ADMIN'],
        created_by: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(flag.rollout_strategy).toBe('roles');
      expect(flag.allowed_roles?.length).toBe(2);
    });

    it('should support custom rules', () => {
      const flag: FeatureFlag = {
        id: 'flag-7',
        key: 'geo_feature',
        name: 'Geo Feature',
        type: 'boolean',
        default_value: false,
        status: 'active',
        rollout_strategy: 'custom',
        custom_rules: {
          countries: ['US', 'CA', 'UK'],
          min_account_age_days: 30,
        },
        created_by: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(flag.rollout_strategy).toBe('custom');
      expect(flag.custom_rules?.countries).toContain('US');
    });

    it('should support tags', () => {
      const flag: FeatureFlag = {
        id: 'flag-8',
        key: 'tagged_feature',
        name: 'Tagged Feature',
        type: 'boolean',
        default_value: false,
        status: 'active',
        rollout_strategy: 'all',
        tags: ['experiment', 'ui', 'performance'],
        created_by: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(flag.tags?.length).toBe(3);
      expect(flag.tags).toContain('experiment');
    });
  });

  describe('FlagEvaluation interface', () => {
    it('should have all required fields', () => {
      const evaluation: FlagEvaluation = {
        flag_id: 'flag-123',
        user_id: 'user-456',
        value: true,
        matched_rule: 'percentage',
        evaluated_at: new Date().toISOString(),
      };

      expect(evaluation.flag_id).toBe('flag-123');
      expect(evaluation.user_id).toBe('user-456');
      expect(evaluation.value).toBe(true);
      expect(evaluation.matched_rule).toBe('percentage');
    });

    it('should allow optional matched_rule', () => {
      const evaluation: FlagEvaluation = {
        flag_id: 'flag-123',
        user_id: 'user-456',
        value: false,
        evaluated_at: new Date().toISOString(),
      };

      expect(evaluation.matched_rule).toBeUndefined();
    });
  });

  describe('FlagOverride interface', () => {
    it('should have all required fields', () => {
      const override: FlagOverride = {
        id: 'override-123',
        flag_id: 'flag-456',
        user_id: 'user-789',
        value: true,
        reason: 'Beta tester',
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        created_at: new Date().toISOString(),
      };

      expect(override.id).toBe('override-123');
      expect(override.flag_id).toBe('flag-456');
      expect(override.user_id).toBe('user-789');
      expect(override.value).toBe(true);
      expect(override.reason).toBe('Beta tester');
    });

    it('should allow optional reason and expires_at', () => {
      const override: FlagOverride = {
        id: 'override-123',
        flag_id: 'flag-456',
        user_id: 'user-789',
        value: false,
        created_at: new Date().toISOString(),
      };

      expect(override.reason).toBeUndefined();
      expect(override.expires_at).toBeUndefined();
    });
  });
});
