import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface EventRSVP {
  id: string;
  event_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  status: 'going' | 'interested' | 'not_going';
  guest_count: number;
  dietary_restrictions?: string[];
  accessibility_needs?: string;
  notes?: string;
  checked_in: boolean;
  checked_in_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RSVPSummary {
  event_id: string;
  going: number;
  interested: number;
  not_going: number;
  total_guests: number;
  capacity: number;
  capacity_remaining: number;
  is_full: boolean;
}

export interface CreateRSVPInput {
  event_id: string;
  status: EventRSVP['status'];
  guest_count?: number;
  dietary_restrictions?: string[];
  accessibility_needs?: string;
  notes?: string;
}

async function fetchEventRSVPs(eventId: string): Promise<{
  rsvps: EventRSVP[];
  summary: RSVPSummary;
}> {
  const response = await fetch(`/api/events/${eventId}/rsvps`);
  if (!response.ok) {
    throw new Error('Failed to fetch RSVPs');
  }
  return response.json();
}

async function fetchMyRSVP(eventId: string): Promise<EventRSVP | null> {
  const response = await fetch(`/api/events/${eventId}/my-rsvp`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch RSVP');
  }
  return response.json();
}

async function createRSVP(input: CreateRSVPInput): Promise<EventRSVP> {
  const response = await fetch(`/api/events/${input.event_id}/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create RSVP');
  }
  return response.json();
}

async function updateRSVP(input: { eventId: string; updates: Partial<CreateRSVPInput> }): Promise<EventRSVP> {
  const response = await fetch(`/api/events/${input.eventId}/rsvp`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input.updates),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update RSVP');
  }
  return response.json();
}

async function cancelRSVP(eventId: string): Promise<void> {
  const response = await fetch(`/api/events/${eventId}/rsvp`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to cancel RSVP');
  }
}

async function fetchMyUpcomingRSVPs(): Promise<{
  rsvps: Array<EventRSVP & {
    event_name: string;
    event_date: string;
    event_time: string;
    venue_name: string;
  }>;
}> {
  const response = await fetch('/api/user/rsvps/upcoming');
  if (!response.ok) {
    throw new Error('Failed to fetch upcoming RSVPs');
  }
  return response.json();
}

export function useEventRSVPs(eventId: string) {
  return useQuery({
    queryKey: ['event-rsvps', eventId],
    queryFn: () => fetchEventRSVPs(eventId),
    enabled: !!eventId,
  });
}

export function useMyRSVP(eventId: string) {
  return useQuery({
    queryKey: ['my-rsvp', eventId],
    queryFn: () => fetchMyRSVP(eventId),
    enabled: !!eventId,
  });
}

export function useCreateRSVP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRSVP,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event-rsvps', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['my-rsvp', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-rsvps'] });
    },
  });
}

export function useUpdateRSVP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRSVP,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event-rsvps', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['my-rsvp', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-rsvps'] });
    },
  });
}

export function useCancelRSVP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelRSVP,
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['event-rsvps', eventId] });
      queryClient.invalidateQueries({ queryKey: ['my-rsvp', eventId] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-rsvps'] });
    },
  });
}

export function useMyUpcomingRSVPs() {
  return useQuery({
    queryKey: ['upcoming-rsvps'],
    queryFn: fetchMyUpcomingRSVPs,
  });
}
