'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CalendarEvent {
  id: string;
  type: 'booking' | 'hold' | 'event';
  title: string;
  date: string;
  start_time?: string;
  end_time?: string;
  status: string;
  client?: { id: string; name: string };
  venue?: { id: string; name: string };
  event_type?: string;
  guest_count?: number;
  color?: string;
  booking_number?: string;
  hold_type?: string;
  space?: { id: string; name: string };
  expires_at?: string;
}

interface CalendarEventsResponse {
  events: CalendarEvent[];
  bookings: CalendarEvent[];
  holds: CalendarEvent[];
  date_range: { start: string; end: string };
  total: number;
}

interface SpaceAvailability {
  space: {
    id: string;
    name: string;
    capacity: number;
    venue: { id: string; name: string };
  };
  availability: Array<{
    date: string;
    available: boolean;
    bookings: number;
    holds: number;
    hold_types: string[];
  }>;
  summary: {
    total_days: number;
    available_days: number;
    booked_days: number;
    availability_rate: number;
  };
}

interface AvailabilityResponse {
  spaces: SpaceAvailability[];
  summary: {
    total_spaces: number;
    fully_available: number;
    partially_available: number;
  };
  date_range: { start: string; end: string };
}

export function useCalendarEvents(params: {
  start_date: string;
  end_date: string;
  venue_id?: string;
  include_holds?: boolean;
}) {
  return useQuery({
    queryKey: ['calendar-events', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set('start_date', params.start_date);
      searchParams.set('end_date', params.end_date);
      if (params.venue_id) searchParams.set('venue_id', params.venue_id);
      if (params.include_holds !== undefined) {
        searchParams.set('include_holds', String(params.include_holds));
      }

      const response = await fetch(`/api/calendar?${searchParams}`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch calendar events' }));
        throw new Error(error.error || 'Failed to fetch calendar events');
      }
      return response.json() as Promise<CalendarEventsResponse>;
    },
    enabled: !!params.start_date && !!params.end_date,
  });
}

export function useSpaceAvailability(params: {
  start_date: string;
  end_date: string;
  venue_id?: string;
  space_id?: string;
  guest_count?: number;
}) {
  return useQuery({
    queryKey: ['space-availability', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set('start_date', params.start_date);
      searchParams.set('end_date', params.end_date);
      if (params.venue_id) searchParams.set('venue_id', params.venue_id);
      if (params.space_id) searchParams.set('space_id', params.space_id);
      if (params.guest_count) searchParams.set('guest_count', String(params.guest_count));

      const response = await fetch(`/api/calendar/availability?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }
      return response.json() as Promise<AvailabilityResponse>;
    },
    enabled: !!params.start_date && !!params.end_date,
  });
}

interface CreateEventInput {
  title: string;
  event_type: 'booking' | 'internal' | 'blocked' | 'maintenance' | 'holiday';
  date: string;
  start_time?: string;
  end_time?: string;
  all_day?: boolean;
  venue_id?: string;
  space_ids?: string[];
  description?: string;
  color?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number;
    end_date?: string;
    days_of_week?: number[];
  };
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEventInput) => {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create event');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['master-calendar'] });
    },
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, ...input }: Partial<CreateEventInput> & { eventId: string }) => {
      const response = await fetch(`/api/calendar/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update event');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['master-calendar'] });
    },
  });
}

export function useRescheduleEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      new_date,
      new_start_time,
      new_end_time,
      notify_attendees,
      reason,
    }: {
      eventId: string;
      new_date: string;
      new_start_time?: string;
      new_end_time?: string;
      notify_attendees?: boolean;
      reason?: string;
    }) => {
      const response = await fetch(`/api/calendar/events/${eventId}/reschedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_date, new_start_time, new_end_time, notify_attendees, reason }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reschedule event');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['master-calendar'] });
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, delete_all }: { eventId: string; delete_all?: boolean }) => {
      const params = delete_all ? '?delete_all=true' : '';
      const response = await fetch(`/api/calendar/events/${eventId}${params}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete event');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['master-calendar'] });
    },
  });
}
