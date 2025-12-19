'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type ApiScope =
  | 'events:read'
  | 'events:write'
  | 'orders:read'
  | 'orders:write'
  | 'tickets:read'
  | 'tickets:write'
  | 'customers:read'
  | 'customers:write'
  | 'analytics:read';

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  scopes: ApiScope[];
  last_used_at?: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateApiKeyInput {
  name: string;
  scopes: ApiScope[];
  expires_at?: string;
}

export const ALL_API_SCOPES: ApiScope[] = [
  'events:read',
  'events:write',
  'orders:read',
  'orders:write',
  'tickets:read',
  'tickets:write',
  'customers:read',
  'customers:write',
  'analytics:read',
];

export const SCOPE_LABELS: Record<ApiScope, string> = {
  'events:read': 'Read Events',
  'events:write': 'Write Events',
  'orders:read': 'Read Orders',
  'orders:write': 'Write Orders',
  'tickets:read': 'Read Tickets',
  'tickets:write': 'Write Tickets',
  'customers:read': 'Read Customers',
  'customers:write': 'Write Customers',
  'analytics:read': 'Read Analytics',
};

export function getScopeLabel(scope: ApiScope): string {
  return SCOPE_LABELS[scope] || scope;
}

async function fetchApiKeys(): Promise<ApiKey[]> {
  const response = await fetch('/api/settings/api-keys');
  if (!response.ok) {
    throw new Error('Failed to fetch API keys');
  }
  const data = await response.json();
  return data.apiKeys || [];
}

async function createApiKey(input: CreateApiKeyInput): Promise<{ apiKey: ApiKey; key: string }> {
  const response = await fetch('/api/settings/api-keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create API key');
  }
  return response.json();
}

async function toggleApiKey(id: string, is_active: boolean): Promise<ApiKey> {
  const response = await fetch('/api/settings/api-keys', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, is_active }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update API key');
  }
  const data = await response.json();
  return data.apiKey;
}

async function deleteApiKey(id: string): Promise<void> {
  const response = await fetch(`/api/settings/api-keys?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete API key');
  }
}

export function useApiKeysData() {
  const queryClient = useQueryClient();

  const apiKeysQuery = useQuery({
    queryKey: ['api-keys'],
    queryFn: fetchApiKeys,
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: createApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => toggleApiKey(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  return {
    apiKeys: apiKeysQuery.data || [],
    isLoading: apiKeysQuery.isLoading,
    error: apiKeysQuery.error,
    refetch: apiKeysQuery.refetch,
    createApiKey: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    toggleApiKey: toggleMutation.mutateAsync,
    isToggling: toggleMutation.isPending,
    deleteApiKey: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
