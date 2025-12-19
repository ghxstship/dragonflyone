import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface AvailabilitySlot {
  date: string;
  space_id: string;
  space_name: string;
  status: 'available' | 'booked' | 'hold' | 'blocked';
  booking_id?: string;
  hold_id?: string;
  hold_expires_at?: string;
}

export interface AvailabilityResponse {
  slots: AvailabilitySlot[];
  summary: {
    total_slots: number;
    available: number;
    booked: number;
    on_hold: number;
  };
}

export interface AvailabilityCheckInput {
  space_ids?: string[];
  start_date: string;
  end_date: string;
  event_type?: string;
  guest_count?: number;
}

export interface Hold {
  id: string;
  space_id: string;
  start_date: string;
  end_date: string;
  priority: 'first_right' | 'standard' | 'low';
  contact_id?: string;
  contact?: {
    id: string;
    full_name: string;
    email: string;
  };
  expires_at: string;
  notes?: string;
  status: 'active' | 'expired' | 'released' | 'converted';
  created_at: string;
}

export interface CreateHoldInput {
  space_id: string;
  start_date: string;
  end_date: string;
  priority?: 'first_right' | 'standard' | 'low';
  contact_id?: string;
  expires_at?: string;
  notes?: string;
}

async function checkAvailability(input: AvailabilityCheckInput): Promise<AvailabilityResponse> {
  const params = new URLSearchParams({
    start_date: input.start_date,
    end_date: input.end_date,
  });
  if (input.space_ids?.length) {
    params.set('space_ids', input.space_ids.join(','));
  }
  if (input.event_type) {
    params.set('event_type', input.event_type);
  }
  if (input.guest_count) {
    params.set('guest_count', input.guest_count.toString());
  }

  const response = await fetch(`/api/availability?${params}`);
  if (!response.ok) {
    throw new Error('Failed to check availability');
  }
  return response.json();
}

async function fetchHolds(filters?: { status?: string; expiring_soon?: boolean }): Promise<{ holds: Hold[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.status) {
    params.set('status', filters.status);
  }
  if (filters?.expiring_soon) {
    params.set('expiring_soon', 'true');
  }

  const response = await fetch(`/api/holds?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch holds');
  }
  return response.json();
}

async function fetchHold(id: string): Promise<Hold> {
  const response = await fetch(`/api/holds/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch hold');
  }
  return response.json();
}

async function createHold(input: CreateHoldInput): Promise<Hold> {
  const response = await fetch('/api/holds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create hold');
  }
  return response.json();
}

async function extendHold({ id, expires_at }: { id: string; expires_at: string }): Promise<Hold> {
  const response = await fetch(`/api/holds/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expires_at }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to extend hold');
  }
  return response.json();
}

async function releaseHold(id: string): Promise<void> {
  const response = await fetch(`/api/holds/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to release hold');
  }
}

async function convertHoldToBooking(id: string): Promise<{ booking_id: string }> {
  const response = await fetch(`/api/holds/${id}/convert`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to convert hold');
  }
  return response.json();
}

export function useAvailability(input: AvailabilityCheckInput | null) {
  return useQuery({
    queryKey: ['availability', input],
    queryFn: () => checkAvailability(input!),
    enabled: !!input && !!input.start_date && !!input.end_date,
  });
}

export function useHolds(filters?: { status?: string; expiring_soon?: boolean }) {
  return useQuery({
    queryKey: ['holds', filters],
    queryFn: () => fetchHolds(filters),
  });
}

export function useHold(id: string) {
  return useQuery({
    queryKey: ['hold', id],
    queryFn: () => fetchHold(id),
    enabled: !!id,
  });
}

export function useExpiringHolds() {
  return useQuery({
    queryKey: ['holds', { expiring_soon: true }],
    queryFn: () => fetchHolds({ expiring_soon: true }),
  });
}

export function useCreateHold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holds'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

export function useExtendHold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: extendHold,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['holds'] });
      queryClient.invalidateQueries({ queryKey: ['hold', data.id] });
    },
  });
}

export function useReleaseHold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: releaseHold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holds'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

export function useConvertHoldToBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: convertHoldToBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holds'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
