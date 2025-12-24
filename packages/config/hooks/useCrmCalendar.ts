import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CrmCalendarEvent {
  id: string;
  title: string;
  type: 'Meeting' | 'Call' | 'Task' | 'Reminder';
  date: string;
  time: string;
  duration: string;
  attendees: string[];
  location?: string;
  linkedContact?: string;
  linkedDeal?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/calendar';

async function fetchEvents(params?: { type?: string; status?: string }): Promise<CrmCalendarEvent[]> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set('type', params.type);
  if (params?.status) searchParams.set('status', params.status);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch calendar events');
  }

  const { data } = await response.json();
  return data || [];
}

async function createEvent(data: Partial<CrmCalendarEvent>): Promise<CrmCalendarEvent> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create event');
  }

  const result = await response.json();
  return result.data;
}

async function updateEvent(id: string, data: Partial<CrmCalendarEvent>): Promise<CrmCalendarEvent> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update event');
  }

  const result = await response.json();
  return result.data;
}

async function deleteEvents(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete events');
  }
}

export function useCrmCalendarQuery(params?: { type?: string; status?: string }) {
  return useQuery({
    queryKey: ['crm-calendar', params],
    queryFn: () => fetchEvents(params),
    staleTime: 60000,
  });
}

export function useCreateCrmEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm-calendar'] }),
  });
}

export function useUpdateCrmEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CrmCalendarEvent> }) => updateEvent(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm-calendar'] }),
  });
}

export function useDeleteCrmEvents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEvents,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm-calendar'] }),
  });
}

export function useCrmCalendar(params?: { type?: string; status?: string }) {
  const query = useCrmCalendarQuery(params);
  const createMutation = useCreateCrmEvent();
  const updateMutation = useUpdateCrmEvent();
  const deleteMutation = useDeleteCrmEvents();

  const events = query.data || [];
  const today = new Date().toISOString().split('T')[0];

  return {
    events,
    summary: {
      total: events.length,
      today: events.filter(e => e.date === today).length,
      meetings: events.filter(e => e.type === 'Meeting').length,
      scheduled: events.filter(e => e.status === 'Scheduled').length,
    },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createEvent: createMutation.mutate,
    createEventAsync: createMutation.mutateAsync,
    updateEvent: updateMutation.mutate,
    updateEventAsync: updateMutation.mutateAsync,
    deleteEvents: deleteMutation.mutate,
    deleteEventsAsync: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
