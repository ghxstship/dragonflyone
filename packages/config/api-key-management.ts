/**
 * API Key Management System
 * Manage API keys for external integrations and third-party access
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from './supabase-types';

export type ApiKeyScope =
  | 'read:projects'
  | 'write:projects'
  | 'read:events'
  | 'write:events'
  | 'read:tickets'
  | 'write:tickets'
  | 'read:orders'
  | 'write:orders'
  | 'read:crew'
  | 'write:crew'
  | 'read:assets'
  | 'write:assets'
  | 'read:users'
  | 'write:users'
  | 'admin'
  | 'webhooks';

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  scopes: ApiKeyScope[];
  is_active: boolean;
  rate_limit: number; // requests per minute
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiKeyUsage {
  id: string;
  api_key_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  ip_address?: string;
  user_agent?: string;
  request_time_ms: number;
  created_at: string;
}

/**
 * API Key Manager
 * Handles API key generation, validation, and usage tracking
 */
export class ApiKeyManager {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Generate new API key
   */
  async createApiKey(
    userId: string,
    name: string,
    scopes: ApiKeyScope[],
    rateLimit: number = 1000,
    expiresInDays?: number
  ): Promise<{ success: boolean; apiKey?: string; keyData?: ApiKey; error?: string }> {
    try {
      // Generate API key
      const apiKey = this.generateApiKey();
      const keyPrefix = apiKey.substring(0, 12);
      const keyHash = await this.hashApiKey(apiKey);

      // Calculate expiration
      const expiresAt = expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      const { data, error } = await this.supabase
        .from('api_keys')
        .insert({
          user_id: userId,
          name,
          key_prefix: keyPrefix,
          key_hash: keyHash,
          scopes,
          is_active: true,
          rate_limit: rateLimit,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        apiKey, // Only returned once during creation
        keyData: {
          id: data.id,
          user_id: data.user_id,
          name: data.name,
          key_prefix: data.key_prefix,
          key_hash: data.key_hash,
          scopes: (data.scopes as string[]) as ApiKeyScope[],
          is_active: data.is_active ?? false,
          rate_limit: data.rate_limit ?? 1000,
          last_used_at: data.last_used_at ?? undefined,
          expires_at: data.expires_at ?? undefined,
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate random API key
   */
  private generateApiKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'ghs_';
    for (let i = 0; i < 48; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }

  /**
   * Hash API key for storage
   */
  private async hashApiKey(apiKey: string): Promise<string> {
    // In production, use proper crypto hashing
    // This is a simplified version
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    return `hash_${apiKey.slice(-16)}`;
  }

  /**
   * Validate API key
   */
  async validateApiKey(
    apiKey: string
  ): Promise<{
    valid: boolean;
    keyData?: ApiKey;
    error?: string;
  }> {
    try {
      const keyHash = await this.hashApiKey(apiKey);

      const { data, error } = await this.supabase
        .from('api_keys')
        .select('*')
        .eq('key_hash', keyHash)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return { valid: false, error: 'Invalid API key' };
      }

      // Check expiration
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return { valid: false, error: 'API key expired' };
      }

      // Update last used timestamp
      await this.supabase
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', data.id);

      return {
        valid: true,
        keyData: {
          id: data.id,
          user_id: data.user_id,
          name: data.name,
          key_prefix: data.key_prefix,
          key_hash: data.key_hash,
          scopes: (data.scopes as string[]) as ApiKeyScope[],
          is_active: data.is_active ?? false,
          rate_limit: data.rate_limit ?? 1000,
          last_used_at: data.last_used_at ?? undefined,
          expires_at: data.expires_at ?? undefined,
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
      };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Check if API key has required scope
   */
  hasScope(keyData: ApiKey, requiredScope: ApiKeyScope): boolean {
    return keyData.scopes.includes('admin') || keyData.scopes.includes(requiredScope);
  }

  /**
   * Check rate limit
   */
  async checkRateLimit(apiKeyId: string): Promise<{ allowed: boolean; remaining: number }> {
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();

    const { count, error } = await this.supabase
      .from('api_key_usage')
      .select('*', { count: 'exact', head: true })
      .eq('api_key_id', apiKeyId)
      .gte('created_at', oneMinuteAgo);

    if (error) {
      return { allowed: false, remaining: 0 };
    }

    // Get key rate limit
    const { data: keyData } = await this.supabase
      .from('api_keys')
      .select('rate_limit')
      .eq('id', apiKeyId)
      .single();

    const rateLimit = keyData?.rate_limit || 1000;
    const currentUsage = count || 0;

    return {
      allowed: currentUsage < rateLimit,
      remaining: Math.max(0, rateLimit - currentUsage),
    };
  }

  /**
   * Log API key usage
   */
  async logUsage(
    apiKeyId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    requestTimeMs: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.supabase.from('api_key_usage').insert({
      api_key_id: apiKeyId,
      endpoint,
      method,
      status_code: statusCode,
      ip_address: ipAddress,
      user_agent: userAgent,
      request_time_ms: requestTimeMs,
    });
  }

  /**
   * Get user's API keys
   */
  async getApiKeys(userId: string): Promise<ApiKey[]> {
    const { data, error } = await this.supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      key_prefix: row.key_prefix,
      key_hash: row.key_hash,
      scopes: row.scopes,
      is_active: row.is_active,
      rate_limit: row.rate_limit,
      last_used_at: row.last_used_at,
      expires_at: row.expires_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(apiKeyId: string, userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', apiKeyId)
      .eq('user_id', userId);

    return !error;
  }

  /**
   * Delete API key
   */
  async deleteApiKey(apiKeyId: string, userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('api_keys')
      .delete()
      .eq('id', apiKeyId)
      .eq('user_id', userId);

    return !error;
  }

  /**
   * Update API key
   */
  async updateApiKey(
    apiKeyId: string,
    userId: string,
    updates: Partial<Pick<ApiKey, 'name' | 'scopes' | 'rate_limit' | 'is_active'>>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('api_keys')
        .update(updates)
        .eq('id', apiKeyId)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get API key usage statistics
   */
  async getUsageStats(
    apiKeyId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    total_requests: number;
    avg_response_time: number;
    error_rate: number;
    requests_by_endpoint: Record<string, number>;
  }> {
    let query = this.supabase
      .from('api_key_usage')
      .select('*')
      .eq('api_key_id', apiKeyId);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return {
        total_requests: 0,
        avg_response_time: 0,
        error_rate: 0,
        requests_by_endpoint: {},
      };
    }

    const totalRequests = data.length;
    const avgResponseTime =
      data.reduce((sum: number, row: any) => sum + row.request_time_ms, 0) / totalRequests;
    const errorCount = data.filter((row: any) => row.status_code >= 400).length;
    const errorRate = errorCount / totalRequests;

    const requestsByEndpoint: Record<string, number> = {};
    data.forEach((row: any) => {
      requestsByEndpoint[row.endpoint] = (requestsByEndpoint[row.endpoint] || 0) + 1;
    });

    return {
      total_requests: totalRequests,
      avg_response_time: avgResponseTime,
      error_rate: errorRate,
      requests_by_endpoint: requestsByEndpoint,
    };
  }

  /**
   * Rotate API key (generate new key with same settings)
   */
  async rotateApiKey(
    apiKeyId: string,
    userId: string
  ): Promise<{ success: boolean; apiKey?: string; error?: string }> {
    try {
      // Get existing key data
      const { data: oldKey, error: fetchError } = await this.supabase
        .from('api_keys')
        .select('*')
        .eq('id', apiKeyId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !oldKey) {
        return { success: false, error: 'API key not found' };
      }

      // Create new key with same settings
      const result = await this.createApiKey(
        userId,
        oldKey.name,
        (oldKey.scopes as string[]) as ApiKeyScope[],
        oldKey.rate_limit ?? 1000,
        oldKey.expires_at
          ? Math.ceil((new Date(oldKey.expires_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
          : undefined
      );

      if (result.success) {
        // Revoke old key
        await this.revokeApiKey(apiKeyId, userId);
      }

      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

/**
 * Export API key utilities
 */
export const apiKeys = {
  createManager: (supabase: SupabaseClient<Database>) => new ApiKeyManager(supabase),
};

export default apiKeys;
