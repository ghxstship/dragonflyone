import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface SpaceHold {
  id: string;
  space_id: string;
  space_name: string;
  contact_id: string;
  contact_name: string;
  contact_email: string;
  start_date: string;
  end_date: string;
  priority: 'first_option' | 'second_option' | 'tentative';
  status: 'active' | 'converted' | 'expired' | 'released';
  expires_at: string;
  hours_until_expiry: number;
  booking_id?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface SpaceHoldFilters {
  space_id?: string;
  contact_id?: string;
  status?: SpaceHold['status'];
  priority?: SpaceHold['priority'];
  date_from?: string;
  date_to?: string;
}

export interface CreateHoldInput {
  space_id: string;
  contact_id: string;
  start_date: string;
  end_date: string;
  priority: SpaceHold['priority'];
  expires_hours?: number;
  notes?: string;
}

async function fetchSpaceHolds(filters?: SpaceHoldFilters): Promise<{
  holds: SpaceHold[];
  total: number;
  summary: {
    active: number;
    expiring_24h: number;
    expiring_48h: number;
    by_priority: Record<string, number>;
  };
}> {
  const params = new URLSearchParams();
  if (filters?.space_id) params.set('space_id', filters.space_id);
  if (filters?.contact_id) params.set('contact_id', filters.contact_id);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.priority) params.set('priority', filters.priority);
  if (filters?.date_from) params.set('date_from', filters.date_from);
  if (filters?.date_to) params.set('date_to', filters.date_to);

  const response = await fetch(`/api/space-holds?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch space holds');
  }
  return response.json();
}

async function fetchSpaceHold(holdId: string): Promise<SpaceHold> {
  const response = await fetch(`/api/space-holds/${holdId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch space hold');
  }
  return response.json();
}

async function createSpaceHold(input: CreateHoldInput): Promise<SpaceHold> {
  const response = await fetch('/api/space-holds', {
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

async function extendHold(input: { holdId: string; extensionHours: number }): Promise<SpaceHold> {
  const response = await fetch(`/api/space-holds/${input.holdId}/extend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hours: input.extensionHours }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to extend hold');
  }
  return response.json();
}

async function convertHoldToBooking(holdId: string): Promise<{ booking_id: string; hold_released: boolean }> {
  const response = await fetch(`/api/space-holds/${holdId}/convert`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to convert hold');
  }
  return response.json();
}

async function releaseHold(holdId: string): Promise<void> {
  const response = await fetch(`/api/space-holds/${holdId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to release hold');
  }
}

async function changePriority(input: { holdId: string; priority: SpaceHold['priority'] }): Promise<SpaceHold> {
  const response = await fetch(`/api/space-holds/${input.holdId}/priority`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priority: input.priority }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to change priority');
  }
  return response.json();
}

export function useSpaceHolds(filters?: SpaceHoldFilters) {
  return useQuery({
    queryKey: ['space-holds', filters],
    queryFn: () => fetchSpaceHolds(filters),
  });
}

export function useSpaceHold(holdId: string) {
  return useQuery({
    queryKey: ['space-hold', holdId],
    queryFn: () => fetchSpaceHold(holdId),
    enabled: !!holdId,
  });
}

export function useCreateSpaceHold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSpaceHold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-holds'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

export function useExtendHold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: extendHold,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['space-holds'] });
      queryClient.invalidateQueries({ queryKey: ['space-hold', data.id] });
    },
  });
}

export function useConvertHoldToBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: convertHoldToBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-holds'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}

export function useReleaseHold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: releaseHold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-holds'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

export function useChangePriority() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePriority,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['space-holds'] });
      queryClient.invalidateQueries({ queryKey: ['space-hold', data.id] });
    },
  });
}
