'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface EventType {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  default_duration_hours: number;
  requires_approval: boolean;
  min_lead_time_days: number;
  max_capacity?: number;
  default_setup_time_minutes: number;
  default_teardown_time_minutes: number;
  is_active: boolean;
  metadata?: Record<string, unknown>;
  usage_count?: number;
  created_at: string;
  updated_at: string;
}

interface EventTypesResponse {
  event_types: EventType[];
  total: number;
}

interface CreateEventTypeInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  default_duration_hours?: number;
  requires_approval?: boolean;
  min_lead_time_days?: number;
  max_capacity?: number;
  default_setup_time_minutes?: number;
  default_teardown_time_minutes?: number;
  is_active?: boolean;
  organization_id?: string;
}

interface UpdateEventTypeInput {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  default_duration_hours?: number;
  requires_approval?: boolean;
  min_lead_time_days?: number;
  max_capacity?: number;
  default_setup_time_minutes?: number;
  default_teardown_time_minutes?: number;
  is_active?: boolean;
}

async function fetchEventTypes(organizationId?: string, isActive?: boolean): Promise<EventTypesResponse> {
  const params = new URLSearchParams();
  if (organizationId) params.set('organization_id', organizationId);
  if (isActive !== undefined) params.set('is_active', String(isActive));

  const res = await fetch(`/api/event-types?${params}`);
  if (!res.ok) {
    throw new Error('Failed to fetch event types');
  }
  return res.json();
}

async function fetchEventType(id: string): Promise<EventType> {
  const res = await fetch(`/api/event-types/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch event type');
  }
  return res.json();
}

async function createEventType(input: CreateEventTypeInput): Promise<EventType> {
  const res = await fetch('/api/event-types', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create event type');
  }
  return res.json();
}

async function updateEventType(id: string, input: UpdateEventTypeInput): Promise<EventType> {
  const res = await fetch(`/api/event-types/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update event type');
  }
  return res.json();
}

async function deleteEventType(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/event-types/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete event type');
  }
  return res.json();
}

export function useEventTypes(organizationId?: string, isActive?: boolean) {
  return useQuery({
    queryKey: ['event-types', organizationId, isActive],
    queryFn: () => fetchEventTypes(organizationId, isActive),
  });
}

export function useEventType(id: string | undefined) {
  return useQuery({
    queryKey: ['event-type', id],
    queryFn: () => fetchEventType(id!),
    enabled: !!id,
  });
}

export function useCreateEventType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEventType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-types'] });
    },
  });
}

export function useUpdateEventType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEventTypeInput }) =>
      updateEventType(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['event-types'] });
      queryClient.invalidateQueries({ queryKey: ['event-type', id] });
    },
  });
}

export function useDeleteEventType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEventType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-types'] });
    },
  });
}
