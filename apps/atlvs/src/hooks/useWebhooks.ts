'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  payload?: Record<string, unknown>;
  response_status?: number;
  response_body?: string;
  duration_ms?: number;
  attempt_count: number;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  next_retry_at?: string;
  created_at: string;
}

export interface Webhook {
  id: string;
  organization_id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  headers: Record<string, string>;
  is_active: boolean;
  last_triggered_at?: string;
  failure_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  deliveries?: WebhookDelivery[];
}

interface WebhooksResponse {
  webhooks: Webhook[];
  supported_events: string[];
}

interface CreateWebhookInput {
  organization_id: string;
  name: string;
  url: string;
  events: string[];
  headers?: Record<string, string>;
  is_active?: boolean;
}

interface UpdateWebhookInput {
  name?: string;
  url?: string;
  events?: string[];
  headers?: Record<string, string>;
  is_active?: boolean;
}

async function fetchWebhooks(
  organizationId: string,
  includeInactive?: boolean
): Promise<WebhooksResponse> {
  const params = new URLSearchParams();
  params.set('organization_id', organizationId);
  if (includeInactive) params.set('include_inactive', 'true');

  const res = await fetch(`/api/webhooks?${params}`);
  if (!res.ok) throw new Error('Failed to fetch webhooks');
  return res.json();
}

async function fetchWebhook(id: string): Promise<{ webhook: Webhook }> {
  const res = await fetch(`/api/webhooks/${id}`);
  if (!res.ok) throw new Error('Failed to fetch webhook');
  return res.json();
}

async function createWebhook(input: CreateWebhookInput): Promise<{ webhook: Webhook }> {
  const res = await fetch('/api/webhooks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create webhook');
  }
  return res.json();
}

async function updateWebhook(id: string, input: UpdateWebhookInput): Promise<{ webhook: Webhook }> {
  const res = await fetch(`/api/webhooks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to update webhook');
  return res.json();
}

async function deleteWebhook(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/webhooks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete webhook');
  return res.json();
}

async function testWebhook(id: string): Promise<{ success: boolean; response_status?: number }> {
  const res = await fetch(`/api/webhooks/${id}/test`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to test webhook');
  return res.json();
}

export function useWebhooks(organizationId: string | undefined, includeInactive?: boolean) {
  return useQuery({
    queryKey: ['webhooks', organizationId, includeInactive],
    queryFn: () => fetchWebhooks(organizationId!, includeInactive),
    enabled: !!organizationId,
  });
}

export function useWebhook(id: string | undefined) {
  return useQuery({
    queryKey: ['webhook', id],
    queryFn: () => fetchWebhook(id!),
    enabled: !!id,
  });
}

export function useCreateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateWebhookInput }) =>
      updateWebhook(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['webhook', id] });
    },
  });
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });
}

export function useTestWebhook() {
  return useMutation({
    mutationFn: testWebhook,
  });
}
