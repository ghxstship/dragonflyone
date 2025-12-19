import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  interval: number;
  days_of_week?: number[];
  day_of_month?: number;
  month_of_year?: number;
  end_type: 'never' | 'after_occurrences' | 'on_date';
  occurrences?: number;
  end_date?: string;
  exceptions?: string[];
}

export interface RecurringEvent {
  id: string;
  parent_event_id?: string;
  name: string;
  description?: string;
  event_type: string;
  space_id: string;
  space_name: string;
  contact_id?: string;
  contact_name?: string;
  start_time: string;
  end_time: string;
  recurrence_pattern: RecurrencePattern;
  is_recurring: boolean;
  recurrence_index?: number;
  next_occurrence?: string;
  total_occurrences?: number;
  status: 'active' | 'paused' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface CreateRecurringEventInput {
  name: string;
  description?: string;
  event_type: string;
  space_id: string;
  contact_id?: string;
  start_time: string;
  end_time: string;
  recurrence_pattern: RecurrencePattern;
}

export interface UpdateRecurringEventInput {
  id: string;
  update_scope: 'this_only' | 'this_and_future' | 'all';
  name?: string;
  description?: string;
  event_type?: string;
  space_id?: string;
  start_time?: string;
  end_time?: string;
  recurrence_pattern?: RecurrencePattern;
}

async function fetchRecurringEvents(filters?: { spaceId?: string; status?: string }): Promise<{
  events: RecurringEvent[];
  total: number;
}> {
  const params = new URLSearchParams();
  if (filters?.spaceId) params.set('space_id', filters.spaceId);
  if (filters?.status) params.set('status', filters.status);

  const response = await fetch(`/api/recurring-events?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch recurring events');
  }
  return response.json();
}

async function fetchRecurringEventOccurrences(eventId: string, dateRange: { start: string; end: string }): Promise<{
  occurrences: Array<{
    date: string;
    start_time: string;
    end_time: string;
    status: 'scheduled' | 'exception' | 'cancelled';
    exception_reason?: string;
  }>;
}> {
  const params = new URLSearchParams();
  params.set('start', dateRange.start);
  params.set('end', dateRange.end);

  const response = await fetch(`/api/recurring-events/${eventId}/occurrences?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch occurrences');
  }
  return response.json();
}

async function createRecurringEvent(input: CreateRecurringEventInput): Promise<RecurringEvent> {
  const response = await fetch('/api/recurring-events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create recurring event');
  }
  return response.json();
}

async function updateRecurringEvent(input: UpdateRecurringEventInput): Promise<RecurringEvent> {
  const { id, ...data } = input;
  const response = await fetch(`/api/recurring-events/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update recurring event');
  }
  return response.json();
}

async function cancelOccurrence(input: { eventId: string; date: string; reason?: string }): Promise<void> {
  const response = await fetch(`/api/recurring-events/${input.eventId}/cancel-occurrence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: input.date, reason: input.reason }),
  });
  if (!response.ok) {
    throw new Error('Failed to cancel occurrence');
  }
}

async function deleteRecurringEvent(input: { id: string; deleteScope: 'this_only' | 'this_and_future' | 'all' }): Promise<void> {
  const response = await fetch(`/api/recurring-events/${input.id}?scope=${input.deleteScope}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete recurring event');
  }
}

export function useRecurringEvents(filters?: { spaceId?: string; status?: string }) {
  return useQuery({
    queryKey: ['recurring-events', filters],
    queryFn: () => fetchRecurringEvents(filters),
  });
}

export function useRecurringEventOccurrences(eventId: string, dateRange: { start: string; end: string }) {
  return useQuery({
    queryKey: ['recurring-event-occurrences', eventId, dateRange],
    queryFn: () => fetchRecurringEventOccurrences(eventId, dateRange),
    enabled: !!eventId && !!dateRange.start && !!dateRange.end,
  });
}

export function useCreateRecurringEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRecurringEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}

export function useUpdateRecurringEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRecurringEvent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recurring-events'] });
      queryClient.invalidateQueries({ queryKey: ['recurring-event-occurrences', data.id] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}

export function useCancelOccurrence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOccurrence,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recurring-event-occurrences', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}

export function useDeleteRecurringEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecurringEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}
