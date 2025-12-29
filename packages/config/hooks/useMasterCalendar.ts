import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';

// Import types and constants from shared types file
import type {
  CalendarSourceType,
  CalendarEventStatus,
  CalendarVisibility,
  MasterCalendarEvent,
  MasterCalendarFilters,
} from '../types/calendar-types';

// Re-export types and constants for backwards compatibility
export type { CalendarSourceType, CalendarEventStatus, CalendarVisibility, MasterCalendarEvent, MasterCalendarFilters };
export {
  SOURCE_TYPE_LABELS,
  SOURCE_TYPE_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
} from '../types/calendar-types';

export interface CreateMasterCalendarEventInput {
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  all_day?: boolean;
  timezone?: string;
  setup_start?: string;
  breakdown_end?: string;
  source_type?: CalendarSourceType;
  source_id?: string;
  source_table?: string;
  status?: CalendarEventStatus;
  visibility?: CalendarVisibility;
  location?: string;
  venue_id?: string;
  space_id?: string;
  is_virtual?: boolean;
  meeting_url?: string;
  meeting_provider?: string;
  event_id?: string;
  project_id?: string;
  production_id?: string;
  contact_id?: string;
  deal_id?: string;
  booking_id?: string;
  attendees?: Array<{
    user_id?: string;
    email: string;
    name?: string;
    response_status?: 'pending' | 'accepted' | 'declined' | 'tentative';
  }>;
  guest_count?: number;
  department?: string;
  responsible?: string;
  artist_id?: string;
  artist_name?: string;
  stage?: string;
  is_recurring?: boolean;
  recurrence_rule?: string;
  reminder_minutes?: number[];
  color?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  internal_notes?: string;
}

export type UpdateMasterCalendarEventInput = Partial<CreateMasterCalendarEventInput>;

interface MasterCalendarResponse {
  data: MasterCalendarEvent[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface SyncResponse {
  success: boolean;
  results: Record<string, { created: number; updated: number; skipped: number }>;
  totals: { created: number; updated: number; skipped: number };
  message: string;
}

interface SyncStatusResponse {
  recent_syncs: Array<{
    id: string;
    action: string;
    direction: string;
    changes: Record<string, unknown>;
    status: string;
    created_at: string;
  }>;
  counts_by_source: Record<string, number>;
  total_events: number;
}

const API_BASE = '/api/master-calendar';

async function fetchMasterCalendarEvents(filters: MasterCalendarFilters): Promise<MasterCalendarResponse> {
  const searchParams = new URLSearchParams();
  
  if (filters.start_date) searchParams.set('start_date', filters.start_date);
  if (filters.end_date) searchParams.set('end_date', filters.end_date);
  if (filters.source_types?.length) searchParams.set('source_types', filters.source_types.join(','));
  if (filters.venue_id) searchParams.set('venue_id', filters.venue_id);
  if (filters.project_id) searchParams.set('project_id', filters.project_id);
  if (filters.production_id) searchParams.set('production_id', filters.production_id);
  if (filters.status?.length) searchParams.set('status', filters.status.join(','));
  if (filters.visibility) searchParams.set('visibility', filters.visibility);
  if (filters.assigned_to) searchParams.set('assigned_to', filters.assigned_to);
  if (filters.limit) searchParams.set('limit', String(filters.limit));
  if (filters.offset) searchParams.set('offset', String(filters.offset));

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch calendar events');
  }

  return response.json();
}

async function fetchMasterCalendarEvent(id: string): Promise<{ data: MasterCalendarEvent }> {
  const response = await fetch(`${API_BASE}/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch calendar event');
  }

  return response.json();
}

async function createMasterCalendarEvent(data: CreateMasterCalendarEventInput): Promise<{ data: MasterCalendarEvent }> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create calendar event');
  }

  return response.json();
}

async function updateMasterCalendarEvent(
  id: string,
  data: UpdateMasterCalendarEventInput
): Promise<{ data: MasterCalendarEvent }> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update calendar event');
  }

  return response.json();
}

async function deleteMasterCalendarEvent(id: string, hard = false): Promise<void> {
  const url = hard ? `${API_BASE}/${id}?hard=true` : `${API_BASE}/${id}`;
  const response = await fetch(url, { method: 'DELETE' });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete calendar event');
  }
}

async function syncMasterCalendar(
  sourceType: CalendarSourceType | 'all' = 'all',
  force = false
): Promise<SyncResponse> {
  const response = await fetch(`${API_BASE}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source_type: sourceType, force }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sync calendar');
  }

  return response.json();
}

async function getSyncStatus(): Promise<SyncStatusResponse> {
  const response = await fetch(`${API_BASE}/sync`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get sync status');
  }

  return response.json();
}

// Query hooks
export function useMasterCalendarQuery(filters: MasterCalendarFilters = {}) {
  return useQuery({
    queryKey: ['master-calendar', filters],
    queryFn: () => fetchMasterCalendarEvents(filters),
    staleTime: 30000,
  });
}

export function useMasterCalendarEventQuery(id: string) {
  return useQuery({
    queryKey: ['master-calendar', 'event', id],
    queryFn: () => fetchMasterCalendarEvent(id),
    enabled: !!id,
  });
}

export function useSyncStatusQuery() {
  return useQuery({
    queryKey: ['master-calendar', 'sync-status'],
    queryFn: getSyncStatus,
    staleTime: 60000,
  });
}

// Mutation hooks
export function useCreateMasterCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMasterCalendarEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-calendar'] });
    },
  });
}

export function useUpdateMasterCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMasterCalendarEventInput }) =>
      updateMasterCalendarEvent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['master-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['master-calendar', 'event', variables.id] });
    },
  });
}

export function useDeleteMasterCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, hard }: { id: string; hard?: boolean }) =>
      deleteMasterCalendarEvent(id, hard),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-calendar'] });
    },
  });
}

export function useSyncMasterCalendar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sourceType, force }: { sourceType?: CalendarSourceType | 'all'; force?: boolean }) =>
      syncMasterCalendar(sourceType, force),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['master-calendar', 'sync-status'] });
      // Also invalidate breakout calendar queries
      queryClient.invalidateQueries({ queryKey: ['crm-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

// Real-time subscription hook
export function useMasterCalendarRealtime(organizationId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!organizationId) return;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase
      .channel('master-calendar-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'master_calendar_events',
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload) => {
          // Invalidate queries on any change
          queryClient.invalidateQueries({ queryKey: ['master-calendar'] });
          
          // If it's an update or delete, also invalidate the specific event
          if (payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
            const eventId = (payload.old as { id?: string })?.id || (payload.new as { id?: string })?.id;
            if (eventId) {
              queryClient.invalidateQueries({ queryKey: ['master-calendar', 'event', eventId] });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId, queryClient]);
}

// Combined hook for easy usage
export function useMasterCalendar(filters: MasterCalendarFilters = {}) {
  const query = useMasterCalendarQuery(filters);
  const createMutation = useCreateMasterCalendarEvent();
  const updateMutation = useUpdateMasterCalendarEvent();
  const deleteMutation = useDeleteMasterCalendarEvent();
  const syncMutation = useSyncMasterCalendar();

  const events = useMemo(() => query.data?.data || [], [query.data?.data]);
  const pagination = query.data?.pagination;

  // Calculate summary statistics
  const summary = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: pagination?.total || 0,
      today: events.filter(e => e.start_datetime.startsWith(today)).length,
      upcoming: events.filter(e => new Date(e.start_datetime) > new Date()).length,
      bySourceType: events.reduce((acc, e) => {
        acc[e.source_type] = (acc[e.source_type] || 0) + 1;
        return acc;
      }, {} as Record<CalendarSourceType, number>),
      byStatus: events.reduce((acc, e) => {
        acc[e.status] = (acc[e.status] || 0) + 1;
        return acc;
      }, {} as Record<CalendarEventStatus, number>),
    };
  }, [events, pagination?.total]);

  // Helper to get events for a specific date
  const getEventsForDate = useCallback((date: string) => {
    return events.filter(e => {
      const eventDate = e.start_datetime.split('T')[0];
      return eventDate === date;
    });
  }, [events]);

  // Helper to get events for a date range
  const getEventsInRange = useCallback((startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return events.filter(e => {
      const eventStart = new Date(e.start_datetime);
      const eventEnd = new Date(e.end_datetime);
      return eventStart <= end && eventEnd >= start;
    });
  }, [events]);

  // Helper to filter by source type
  const getEventsBySourceType = useCallback((sourceType: CalendarSourceType) => {
    return events.filter(e => e.source_type === sourceType);
  }, [events]);

  return {
    // Data
    events,
    pagination,
    summary,
    
    // Query state
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    
    // Mutations
    createEvent: createMutation.mutate,
    createEventAsync: createMutation.mutateAsync,
    updateEvent: updateMutation.mutate,
    updateEventAsync: updateMutation.mutateAsync,
    deleteEvent: deleteMutation.mutate,
    deleteEventAsync: deleteMutation.mutateAsync,
    syncCalendar: syncMutation.mutate,
    syncCalendarAsync: syncMutation.mutateAsync,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSyncing: syncMutation.isPending,
    
    // Helpers
    getEventsForDate,
    getEventsInRange,
    getEventsBySourceType,
  };
}
