'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type WebhookEventType =
  | 'order.created'
  | 'order.completed'
  | 'order.cancelled'
  | 'order.refunded'
  | 'ticket.transferred'
  | 'ticket.scanned'
  | 'event.published'
  | 'event.updated'
  | 'event.cancelled'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'customer.created'
  | 'customer.updated';

export type WebhookStatus = 'active' | 'paused' | 'failed' | 'disabled';

export interface WebhookEndpoint {
  id: string;
  user_id: string;
  name: string;
  url: string;
  description?: string;
  secret: string;
  events: WebhookEventType[];
  status: WebhookStatus;
  headers: Record<string, string>;
  retry_count: number;
  timeout_ms: number;
  last_triggered_at?: string;
  last_success_at?: string;
  last_failure_at?: string;
  failure_count: number;
  success_count: number;
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  endpoint_id: string;
  event_type: WebhookEventType;
  payload: Record<string, unknown>;
  response_status?: number;
  response_body?: string;
  response_time_ms?: number;
  attempt_number: number;
  success: boolean;
  error_message?: string;
  created_at: string;
}

export interface CreateWebhookInput {
  name: string;
  url: string;
  description?: string;
  events: WebhookEventType[];
  headers?: Record<string, string>;
  retry_count?: number;
  timeout_ms?: number;
}

export interface UpdateWebhookInput {
  id: string;
  name?: string;
  url?: string;
  description?: string;
  events?: WebhookEventType[];
  status?: 'active' | 'paused' | 'disabled';
  headers?: Record<string, string>;
  retry_count?: number;
  timeout_ms?: number;
}

const WEBHOOK_EVENT_LABELS: Record<WebhookEventType, string> = {
  'order.created': 'Order Created',
  'order.completed': 'Order Completed',
  'order.cancelled': 'Order Cancelled',
  'order.refunded': 'Order Refunded',
  'ticket.transferred': 'Ticket Transferred',
  'ticket.scanned': 'Ticket Scanned',
  'event.published': 'Event Published',
  'event.updated': 'Event Updated',
  'event.cancelled': 'Event Cancelled',
  'payment.succeeded': 'Payment Succeeded',
  'payment.failed': 'Payment Failed',
  'customer.created': 'Customer Created',
  'customer.updated': 'Customer Updated',
};

export const ALL_WEBHOOK_EVENTS: WebhookEventType[] = Object.keys(WEBHOOK_EVENT_LABELS) as WebhookEventType[];

export function getEventLabel(eventType: WebhookEventType): string {
  return WEBHOOK_EVENT_LABELS[eventType] || eventType;
}

async function fetchWebhooks(): Promise<WebhookEndpoint[]> {
  const response = await fetch('/api/settings/webhooks');
  if (!response.ok) {
    throw new Error('Failed to fetch webhooks');
  }
  const data = await response.json();
  return data.endpoints || [];
}

async function fetchWebhookDetails(id: string, includeDeliveries: boolean): Promise<{
  endpoint: WebhookEndpoint;
  deliveries: WebhookDelivery[] | null;
}> {
  const url = `/api/settings/webhooks?id=${id}${includeDeliveries ? '&deliveries=true' : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Webhook not found');
  }
  return response.json();
}

async function createWebhook(input: CreateWebhookInput): Promise<{ endpoint: WebhookEndpoint; secret: string }> {
  const response = await fetch('/api/settings/webhooks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create webhook');
  }
  return response.json();
}

async function updateWebhook(input: UpdateWebhookInput): Promise<WebhookEndpoint> {
  const response = await fetch('/api/settings/webhooks', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update webhook');
  }
  const data = await response.json();
  return data.endpoint;
}

async function deleteWebhook(id: string): Promise<void> {
  const response = await fetch(`/api/settings/webhooks?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete webhook');
  }
}

export function useWebhooksData() {
  const queryClient = useQueryClient();

  const webhooksQuery = useQuery({
    queryKey: ['webhooks'],
    queryFn: fetchWebhooks,
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: createWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });

  return {
    webhooks: webhooksQuery.data || [],
    isLoading: webhooksQuery.isLoading,
    error: webhooksQuery.error,
    refetch: webhooksQuery.refetch,
    createWebhook: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateWebhook: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteWebhook: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export function useWebhookDetails(id: string | null, includeDeliveries = false) {
  return useQuery({
    queryKey: ['webhook', id, includeDeliveries],
    queryFn: () => fetchWebhookDetails(id!, includeDeliveries),
    enabled: !!id,
    staleTime: 15000,
  });
}
