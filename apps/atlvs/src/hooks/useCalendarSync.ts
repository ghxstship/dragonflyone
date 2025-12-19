import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CalendarIntegration {
  id: string;
  provider: 'google' | 'outlook' | 'apple' | 'ical';
  name: string;
  calendar_id: string;
  sync_enabled: boolean;
  sync_direction: 'push' | 'pull' | 'both';
  last_synced_at?: string;
  sync_status: 'active' | 'error' | 'disconnected';
  error_message?: string;
  settings: {
    sync_bookings: boolean;
    sync_holds: boolean;
    sync_tasks: boolean;
    default_reminder_minutes?: number;
  };
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  external_id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location?: string;
  source: 'internal' | 'external';
  source_type?: 'booking' | 'hold' | 'task' | 'personal';
  source_id?: string;
  integration_id?: string;
}

async function fetchCalendarIntegrations(): Promise<{ integrations: CalendarIntegration[]; total: number }> {
  const response = await fetch('/api/calendar/integrations');
  if (!response.ok) {
    throw new Error('Failed to fetch calendar integrations');
  }
  return response.json();
}

async function connectCalendar(provider: CalendarIntegration['provider']): Promise<{ auth_url: string }> {
  const response = await fetch('/api/calendar/connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to connect calendar');
  }
  return response.json();
}

async function disconnectCalendar(integrationId: string): Promise<void> {
  const response = await fetch(`/api/calendar/integrations/${integrationId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to disconnect calendar');
  }
}

async function syncCalendar(integrationId: string): Promise<{ synced_count: number }> {
  const response = await fetch(`/api/calendar/integrations/${integrationId}/sync`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sync calendar');
  }
  return response.json();
}

async function updateCalendarSettings(input: { id: string; settings: CalendarIntegration['settings'] }): Promise<CalendarIntegration> {
  const response = await fetch(`/api/calendar/integrations/${input.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings: input.settings }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update settings');
  }
  return response.json();
}

async function fetchCalendarEvents(dateRange: { start: string; end: string }): Promise<{ events: CalendarEvent[]; total: number }> {
  const params = new URLSearchParams();
  params.set('start', dateRange.start);
  params.set('end', dateRange.end);

  const response = await fetch(`/api/calendar/events?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch calendar events');
  }
  return response.json();
}

export function useCalendarIntegrations() {
  return useQuery({
    queryKey: ['calendar-integrations'],
    queryFn: fetchCalendarIntegrations,
  });
}

export function useConnectCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: connectCalendar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-integrations'] });
    },
  });
}

export function useDisconnectCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectCalendar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-integrations'] });
    },
  });
}

export function useSyncCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncCalendar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-integrations'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

export function useUpdateCalendarSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCalendarSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-integrations'] });
    },
  });
}

export function useCalendarEvents(dateRange: { start: string; end: string }) {
  return useQuery({
    queryKey: ['calendar-events', dateRange],
    queryFn: () => fetchCalendarEvents(dateRange),
    enabled: !!dateRange.start && !!dateRange.end,
  });
}
