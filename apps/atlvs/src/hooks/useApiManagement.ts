'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// API MANAGEMENT HOOKS
// Manage API keys, webhooks, and integration logs for productions
// Event-level roles: Admin, Developer, Integration Manager
// =============================================================================

export interface ApiKey {
  id: string;
  production_id: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  rate_limit?: number;
  is_active: boolean;
  last_used_at?: string;
  expires_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Webhook {
  id: string;
  production_id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  is_active: boolean;
  last_triggered_at?: string;
  failure_count: number;
  created_at: string;
  updated_at: string;
}

export interface ApiLog {
  id: string;
  production_id: string;
  api_key_id?: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  ip_address?: string;
  user_agent?: string;
  request_body?: Record<string, unknown>;
  response_body?: Record<string, unknown>;
  error_message?: string;
  created_at: string;
}

interface ApiKeyFilters {
  productionId?: string;
  isActive?: boolean;
}

interface WebhookFilters {
  productionId?: string;
  isActive?: boolean;
}

interface ApiLogFilters {
  productionId?: string;
  apiKeyId?: string;
  startDate?: string;
  endDate?: string;
  statusCode?: number;
}

// Fetch API keys
export function useApiKeys(filters?: ApiKeyFilters) {
  return useQuery({
    queryKey: ['api_keys', filters],
    queryFn: async () => {
      let query = supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.productionId) {
        query = query.eq('production_id', filters.productionId);
      }
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as ApiKey[];
    },
  });
}

// Fetch webhooks
export function useWebhooks(filters?: WebhookFilters) {
  return useQuery({
    queryKey: ['webhooks', filters],
    queryFn: async () => {
      let query = supabase
        .from('webhooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.productionId) {
        query = query.eq('production_id', filters.productionId);
      }
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Webhook[];
    },
  });
}

// Fetch API logs
export function useApiLogs(filters?: ApiLogFilters) {
  return useQuery({
    queryKey: ['api_logs', filters],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filters?.productionId) {
        query = query.eq('production_id', filters.productionId);
      }
      if (filters?.apiKeyId) {
        query = query.eq('api_key_id', filters.apiKeyId);
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      if (filters?.statusCode) {
        query = query.eq('status_code', filters.statusCode);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as ApiLog[];
    },
  });
}

// Create API key
export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (apiKey: Omit<ApiKey, 'id' | 'key_prefix' | 'created_at' | 'updated_at'>) => {
      // Generate a random key prefix for display
      const keyPrefix = `atlvs_${Math.random().toString(36).substring(2, 10)}`;
      
      const { data, error } = await supabase
        .from('api_keys')
        .insert({ ...apiKey, key_prefix: keyPrefix })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api_keys'] });
    },
  });
}

// Update API key
export function useUpdateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ApiKey> & { id: string }) => {
      const { data, error } = await supabase
        .from('api_keys')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api_keys'] });
    },
  });
}

// Revoke API key
export function useRevokeApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api_keys'] });
    },
  });
}

// Create webhook
export function useCreateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (webhook: Omit<Webhook, 'id' | 'failure_count' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('webhooks')
        .insert({ ...webhook, failure_count: 0 })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });
}

// Update webhook
export function useUpdateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Webhook> & { id: string }) => {
      const { data, error } = await supabase
        .from('webhooks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });
}

// Delete webhook
export function useDeleteWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });
}

// Get API stats
export function useApiStats(productionId?: string) {
  return useQuery({
    queryKey: ['api_stats', productionId],
    queryFn: async () => {
      const [keysResult, webhooksResult, logsResult] = await Promise.all([
        supabase.from('api_keys').select('is_active').eq('production_id', productionId || ''),
        supabase.from('webhooks').select('is_active, failure_count').eq('production_id', productionId || ''),
        supabase.from('audit_logs').select('status_code, response_time_ms').eq('production_id', productionId || '').limit(1000),
      ]);

      const keys = keysResult.data || [];
      const webhooks = webhooksResult.data || [];
      const logs = logsResult.data || [];

      const successLogs = logs.filter(l => l.status_code >= 200 && l.status_code < 300);
      const avgResponseTime = logs.length > 0 
        ? Math.round(logs.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / logs.length)
        : 0;

      return {
        totalKeys: keys.length,
        activeKeys: keys.filter(k => k.is_active).length,
        totalWebhooks: webhooks.length,
        activeWebhooks: webhooks.filter(w => w.is_active).length,
        failingWebhooks: webhooks.filter(w => w.failure_count > 0).length,
        totalRequests: logs.length,
        successRate: logs.length > 0 ? Math.round((successLogs.length / logs.length) * 100) : 0,
        avgResponseTime,
      };
    },
    enabled: !!productionId,
  });
}
