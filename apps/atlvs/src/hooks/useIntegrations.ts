'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Integration {
  id: string;
  organization_id: string;
  provider: string;
  provider_display_name?: string;
  status: 'pending' | 'connected' | 'disconnected' | 'error';
  credentials?: Record<string, unknown>;
  settings: Record<string, unknown>;
  scopes: string[];
  access_token_expires_at?: string;
  refresh_token_expires_at?: string;
  last_sync_at?: string;
  last_error?: string;
  sync_enabled: boolean;
  sync_frequency_minutes: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface IntegrationProvider {
  id: string;
  name: string;
  category: string;
  icon: string;
}

interface IntegrationsResponse {
  connected: Integration[];
  available?: IntegrationProvider[];
  all_providers?: IntegrationProvider[];
}

interface ConnectIntegrationInput {
  organization_id: string;
  provider: string;
  credentials?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  scopes?: string[];
}

interface UpdateIntegrationInput {
  settings?: Record<string, unknown>;
  sync_enabled?: boolean;
  sync_frequency_minutes?: number;
}

async function fetchIntegrations(
  organizationId: string,
  includeAvailable?: boolean
): Promise<IntegrationsResponse> {
  const params = new URLSearchParams();
  params.set('organization_id', organizationId);
  if (includeAvailable) params.set('include_available', 'true');

  const res = await fetch(`/api/integrations?${params}`);
  if (!res.ok) throw new Error('Failed to fetch integrations');
  return res.json();
}

async function fetchIntegration(id: string): Promise<{ integration: Integration }> {
  const res = await fetch(`/api/integrations/${id}`);
  if (!res.ok) throw new Error('Failed to fetch integration');
  return res.json();
}

async function connectIntegration(input: ConnectIntegrationInput): Promise<{ integration: Integration }> {
  const res = await fetch('/api/integrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to connect integration');
  }
  return res.json();
}

async function updateIntegration(
  id: string,
  input: UpdateIntegrationInput
): Promise<{ integration: Integration }> {
  const res = await fetch(`/api/integrations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to update integration');
  return res.json();
}

async function disconnectIntegration(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/integrations/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to disconnect integration');
  return res.json();
}

async function syncIntegration(id: string): Promise<{ sync_started: boolean }> {
  const res = await fetch(`/api/integrations/${id}/sync`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to trigger sync');
  return res.json();
}

export function useIntegrations(organizationId: string | undefined, includeAvailable?: boolean) {
  return useQuery({
    queryKey: ['integrations', organizationId, includeAvailable],
    queryFn: () => fetchIntegrations(organizationId!, includeAvailable),
    enabled: !!organizationId,
  });
}

export function useIntegration(id: string | undefined) {
  return useQuery({
    queryKey: ['integration', id],
    queryFn: () => fetchIntegration(id!),
    enabled: !!id,
  });
}

export function useConnectIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: connectIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}

export function useUpdateIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateIntegrationInput }) =>
      updateIntegration(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['integration', id] });
    },
  });
}

export function useDisconnectIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}

export function useSyncIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncIntegration,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['integration', id] });
    },
  });
}
