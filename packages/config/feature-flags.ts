/**
 * Feature Flags System
 * Control feature rollouts, A/B testing, and gradual deployments
 */

import { createClient } from '@supabase/supabase-js';

export type FlagType = 'boolean' | 'string' | 'number' | 'json';
export type FlagStatus = 'active' | 'inactive' | 'archived';
export type RolloutStrategy = 'all' | 'percentage' | 'users' | 'roles' | 'custom';

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  type: FlagType;
  default_value: any;
  status: FlagStatus;
  rollout_strategy: RolloutStrategy;
  rollout_percentage?: number;
  allowed_users?: string[];
  allowed_roles?: string[];
  custom_rules?: Record<string, any>;
  tags?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FlagEvaluation {
  flag_id: string;
  user_id: string;
  value: any;
  matched_rule?: string;
  evaluated_at: string;
}

export interface FlagOverride {
  id: string;
  flag_id: string;
  user_id: string;
  value: any;
  reason?: string;
  expires_at?: string;
  created_at: string;
}

/**
 * Feature Flags Manager
 * Evaluate and manage feature flags
 */
export class FeatureFlagsManager {
  private cache: Map<string, FeatureFlag> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
  private lastCacheUpdate: number = 0;

  constructor(private supabase: ReturnType<typeof createClient>) {}

  /**
   * Create feature flag
   */
  async createFlag(
    flag: Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ success: boolean; flagId?: string; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('feature_flags')
        .insert(flag)
        .select('id')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Invalidate cache
      this.lastCacheUpdate = 0;

      return { success: true, flagId: data.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all active flags
   */
  async getActiveFlags(): Promise<FeatureFlag[]> {
    // Check cache
    if (Date.now() - this.lastCacheUpdate < this.cacheExpiry && this.cache.size > 0) {
      return Array.from(this.cache.values()).filter((f) => f.status === 'active');
    }

    const { data, error } = await this.supabase
      .from('feature_flags')
      .select('*')
      .eq('status', 'active');

    if (error || !data) {
      return [];
    }

    // Update cache
    this.cache.clear();
    data.forEach((flag: FeatureFlag) => {
      this.cache.set(flag.key, flag);
    });
    this.lastCacheUpdate = Date.now();

    return data as FeatureFlag[];
  }

  /**
   * Get flag by key
   */
  async getFlag(key: string): Promise<FeatureFlag | null> {
    // Check cache first
    if (this.cache.has(key) && Date.now() - this.lastCacheUpdate < this.cacheExpiry) {
      return this.cache.get(key) || null;
    }

    const { data, error } = await this.supabase
      .from('feature_flags')
      .select('*')
      .eq('key', key)
      .single();

    if (error || !data) {
      return null;
    }

    // Update cache
    this.cache.set(key, data as FeatureFlag);

    return data as FeatureFlag;
  }

  /**
   * Evaluate flag for user
   */
  async evaluateFlag(
    flagKey: string,
    userId: string,
    context?: Record<string, any>
  ): Promise<any> {
    // Check for user override first
    const override = await this.getUserOverride(flagKey, userId);
    if (override) {
      return override.value;
    }

    const flag = await this.getFlag(flagKey);
    if (!flag || flag.status !== 'active') {
      return flag?.default_value || false;
    }

    // Evaluate based on rollout strategy
    let value = flag.default_value;
    let matchedRule = 'default';

    switch (flag.rollout_strategy) {
      case 'all':
        value = this.getEnabledValue(flag);
        matchedRule = 'all';
        break;

      case 'percentage':
        if (this.isInPercentage(userId, flag.rollout_percentage || 0)) {
          value = this.getEnabledValue(flag);
          matchedRule = 'percentage';
        }
        break;

      case 'users':
        if (flag.allowed_users?.includes(userId)) {
          value = this.getEnabledValue(flag);
          matchedRule = 'users';
        }
        break;

      case 'roles':
        if (context?.roles && this.hasAnyRole(context.roles, flag.allowed_roles || [])) {
          value = this.getEnabledValue(flag);
          matchedRule = 'roles';
        }
        break;

      case 'custom':
        if (this.evaluateCustomRules(flag.custom_rules, context)) {
          value = this.getEnabledValue(flag);
          matchedRule = 'custom';
        }
        break;
    }

    // Log evaluation
    await this.logEvaluation(flag.id, userId, value, matchedRule);

    return value;
  }

  /**
   * Evaluate multiple flags
   */
  async evaluateFlags(
    flagKeys: string[],
    userId: string,
    context?: Record<string, any>
  ): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    for (const key of flagKeys) {
      results[key] = await this.evaluateFlag(key, userId, context);
    }

    return results;
  }

  /**
   * Get all flags for user
   */
  async getAllFlagsForUser(
    userId: string,
    context?: Record<string, any>
  ): Promise<Record<string, any>> {
    const flags = await this.getActiveFlags();
    const results: Record<string, any> = {};

    for (const flag of flags) {
      results[flag.key] = await this.evaluateFlag(flag.key, userId, context);
    }

    return results;
  }

  /**
   * Set user override
   */
  async setUserOverride(
    flagKey: string,
    userId: string,
    value: any,
    reason?: string,
    expiresAt?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const flag = await this.getFlag(flagKey);
      if (!flag) {
        return { success: false, error: 'Flag not found' };
      }

      const { error } = await this.supabase.from('flag_overrides').insert({
        flag_id: flag.id,
        user_id: userId,
        value,
        reason,
        expires_at: expiresAt,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove user override
   */
  async removeUserOverride(flagKey: string, userId: string): Promise<boolean> {
    const flag = await this.getFlag(flagKey);
    if (!flag) return false;

    const { error } = await this.supabase
      .from('flag_overrides')
      .delete()
      .eq('flag_id', flag.id)
      .eq('user_id', userId);

    return !error;
  }

  /**
   * Update flag
   */
  async updateFlag(
    flagId: string,
    updates: Partial<Omit<FeatureFlag, 'id' | 'key' | 'created_by' | 'created_at'>>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('feature_flags')
        .update(updates)
        .eq('id', flagId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Invalidate cache
      this.lastCacheUpdate = 0;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Archive flag
   */
  async archiveFlag(flagId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('feature_flags')
      .update({ status: 'archived' })
      .eq('id', flagId);

    if (!error) {
      this.lastCacheUpdate = 0;
    }

    return !error;
  }

  /**
   * Get flag analytics
   */
  async getFlagAnalytics(
    flagId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    total_evaluations: number;
    unique_users: number;
    enabled_count: number;
    disabled_count: number;
  }> {
    const { data, error } = await this.supabase.rpc('get_flag_analytics', {
      p_flag_id: flagId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error || !data) {
      return {
        total_evaluations: 0,
        unique_users: 0,
        enabled_count: 0,
        disabled_count: 0,
      };
    }

    return data;
  }

  /**
   * Get user override
   */
  private async getUserOverride(
    flagKey: string,
    userId: string
  ): Promise<FlagOverride | null> {
    const flag = await this.getFlag(flagKey);
    if (!flag) return null;

    const { data, error } = await this.supabase
      .from('flag_overrides')
      .select('*')
      .eq('flag_id', flag.id)
      .eq('user_id', userId)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .single();

    if (error || !data) {
      return null;
    }

    return data as FlagOverride;
  }

  /**
   * Log flag evaluation
   */
  private async logEvaluation(
    flagId: string,
    userId: string,
    value: any,
    matchedRule: string
  ): Promise<void> {
    await this.supabase.from('flag_evaluations').insert({
      flag_id: flagId,
      user_id: userId,
      value,
      matched_rule: matchedRule,
    });
  }

  /**
   * Get enabled value for flag
   */
  private getEnabledValue(flag: FeatureFlag): any {
    if (flag.type === 'boolean') {
      return true;
    }
    return flag.default_value;
  }

  /**
   * Check if user is in percentage rollout
   */
  private isInPercentage(userId: string, percentage: number): boolean {
    // Consistent hash-based distribution
    const hash = this.hashString(userId);
    return (hash % 100) < percentage;
  }

  /**
   * Hash string for consistent distribution
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Check if user has any of the allowed roles
   */
  private hasAnyRole(userRoles: string[], allowedRoles: string[]): boolean {
    return userRoles.some((role) => allowedRoles.includes(role));
  }

  /**
   * Evaluate custom rules
   */
  private evaluateCustomRules(
    rules?: Record<string, any>,
    context?: Record<string, any>
  ): boolean {
    if (!rules || !context) return false;

    // Simple rule evaluation - can be extended
    for (const [key, value] of Object.entries(rules)) {
      if (context[key] !== value) {
        return false;
      }
    }

    return true;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.lastCacheUpdate = 0;
  }
}

/**
 * Export feature flags utilities
 */
export const featureFlags = {
  createManager: (supabase: ReturnType<typeof createClient>) =>
    new FeatureFlagsManager(supabase),
};

export default featureFlags;
