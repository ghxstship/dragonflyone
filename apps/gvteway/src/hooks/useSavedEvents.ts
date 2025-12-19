import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface SavedEvent {
  id: string;
  user_id: string;
  event_id: string;
  event_name: string;
  event_date: string;
  event_time: string;
  venue_name: string;
  venue_city: string;
  cover_image_url?: string;
  price_range: {
    min: number;
    max: number;
    currency: string;
  };
  is_free: boolean;
  is_sold_out: boolean;
  collection_id?: string;
  collection_name?: string;
  notes?: string;
  reminder_set: boolean;
  reminder_date?: string;
  saved_at: string;
}

export interface EventCollection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  event_count: number;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
}

async function fetchSavedEvents(collectionId?: string): Promise<{
  events: SavedEvent[];
  total: number;
}> {
  const params = new URLSearchParams();
  if (collectionId) params.set('collection_id', collectionId);

  const response = await fetch(`/api/user/saved-events?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch saved events');
  }
  return response.json();
}

async function fetchCollections(): Promise<{ collections: EventCollection[] }> {
  const response = await fetch('/api/user/event-collections');
  if (!response.ok) {
    throw new Error('Failed to fetch collections');
  }
  return response.json();
}

async function saveEvent(input: {
  eventId: string;
  collectionId?: string;
  notes?: string;
  setReminder?: boolean;
  reminderDate?: string;
}): Promise<SavedEvent> {
  const response = await fetch('/api/user/saved-events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save event');
  }
  return response.json();
}

async function unsaveEvent(eventId: string): Promise<void> {
  const response = await fetch(`/api/user/saved-events/${eventId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to unsave event');
  }
}

async function createCollection(input: {
  name: string;
  description?: string;
  isPublic?: boolean;
}): Promise<EventCollection> {
  const response = await fetch('/api/user/event-collections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create collection');
  }
  return response.json();
}

async function moveToCollection(input: { eventId: string; collectionId: string | null }): Promise<SavedEvent> {
  const response = await fetch(`/api/user/saved-events/${input.eventId}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collection_id: input.collectionId }),
  });
  if (!response.ok) {
    throw new Error('Failed to move event');
  }
  return response.json();
}

async function checkIfSaved(eventId: string): Promise<{ saved: boolean; saved_event?: SavedEvent }> {
  const response = await fetch(`/api/user/saved-events/check/${eventId}`);
  if (!response.ok) {
    throw new Error('Failed to check saved status');
  }
  return response.json();
}

export function useSavedEvents(collectionId?: string) {
  return useQuery({
    queryKey: ['saved-events', collectionId],
    queryFn: () => fetchSavedEvents(collectionId),
  });
}

export function useEventCollections() {
  return useQuery({
    queryKey: ['event-collections'],
    queryFn: fetchCollections,
  });
}

export function useSaveEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-events'] });
      queryClient.invalidateQueries({ queryKey: ['event-collections'] });
    },
  });
}

export function useUnsaveEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unsaveEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-events'] });
      queryClient.invalidateQueries({ queryKey: ['event-collections'] });
    },
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-collections'] });
    },
  });
}

export function useMoveToCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveToCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-events'] });
    },
  });
}

export function useCheckIfSaved(eventId: string) {
  return useQuery({
    queryKey: ['event-saved-status', eventId],
    queryFn: () => checkIfSaved(eventId),
    enabled: !!eventId,
  });
}
