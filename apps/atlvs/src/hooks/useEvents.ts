'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Event {
  id: string;
  organization_id: string;
  project_id?: string;
  name: string;
  description?: string;
  event_type: 'concert' | 'festival' | 'corporate' | 'theater' | 'sports' | 'conference' | 'other';
  category?: string;
  venue_name?: string;
  venue_address?: string;
  venue_city?: string;
  venue_state?: string;
  venue_country?: string;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  status: 'draft' | 'scheduled' | 'on_sale' | 'sold_out' | 'completed' | 'cancelled';
  visibility: 'public' | 'private' | 'unlisted';
  capacity?: number;
  tickets_sold?: number;
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
  tags?: string[];
  created_at: string;
  updated_at?: string;
}

interface EventFilters {
  organization_id?: string;
  status?: string;
  event_type?: string;
  start_date?: string;
  end_date?: string;
}

interface EventsResponse {
  events: Event[];
  summary: {
    total: number;
    by_status: Record<string, number>;
    by_type: Record<string, number>;
    total_capacity: number;
    total_tickets_sold: number;
  };
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export function useEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.organization_id) params.append('organization_id', filters.organization_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.event_type) params.append('event_type', filters.event_type);
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);

      const response = await fetch(`/api/events?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      return response.json() as Promise<EventsResponse>;
    },
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      const response = await fetch(`/api/events/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }
      const data = await response.json();
      return data.event as Event;
    },
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      if (!response.ok) {
        throw new Error('Failed to create event');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Event> & { id: string }) => {
      const response = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update event');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', variables.id] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete event');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useEventStats() {
  return useQuery({
    queryKey: ['events', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch event stats');
      }
      const data = await response.json() as EventsResponse;
      return data.summary;
    },
  });
}
