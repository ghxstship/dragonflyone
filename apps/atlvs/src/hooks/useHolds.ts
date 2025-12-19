'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface SpaceHold {
  id: string;
  organization_id: string;
  space_id: string;
  contact_id?: string;
  lead_id?: string;
  hold_date: string;
  start_time?: string;
  end_time?: string;
  priority: 'first_right' | 'standard' | 'low';
  status: 'active' | 'expired' | 'released' | 'converted';
  expires_at: string;
  notes?: string;
  converted_to_booking_id?: string;
  created_at: string;
  updated_at: string;
  space?: {
    id: string;
    name: string;
  };
  contact?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  lead?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface HoldsResponse {
  holds: SpaceHold[];
  total: number;
}

interface ExpiringHold extends SpaceHold {
  hours_until_expiry: number;
  is_expired: boolean;
}

interface ExpiringHoldsResponse {
  holds: ExpiringHold[];
  total: number;
  expired_count: number;
}

interface CreateHoldInput {
  organization_id: string;
  space_id: string;
  contact_id?: string;
  lead_id?: string;
  hold_date: string;
  start_time?: string;
  end_time?: string;
  priority?: 'first_right' | 'standard' | 'low';
  expires_at: string;
  notes?: string;
}

interface UpdateHoldInput {
  expires_at?: string;
  priority?: 'first_right' | 'standard' | 'low';
  notes?: string;
}

interface ConvertHoldInput {
  event_name?: string;
  event_type?: string;
  guest_count_expected?: number;
  special_requests?: string;
}

interface HoldsFilters {
  organization_id: string;
  space_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

async function fetchHolds(filters: HoldsFilters): Promise<HoldsResponse> {
  const params = new URLSearchParams();
  params.set('organization_id', filters.organization_id);
  if (filters.space_id) params.set('space_id', filters.space_id);
  if (filters.status) params.set('status', filters.status);
  if (filters.date_from) params.set('date_from', filters.date_from);
  if (filters.date_to) params.set('date_to', filters.date_to);

  const res = await fetch(`/api/holds?${params}`);
  if (!res.ok) throw new Error('Failed to fetch holds');
  return res.json();
}

async function fetchHold(id: string): Promise<{ hold: SpaceHold }> {
  const res = await fetch(`/api/holds/${id}`);
  if (!res.ok) throw new Error('Failed to fetch hold');
  return res.json();
}

async function fetchExpiringHolds(
  organizationId: string,
  hours?: number
): Promise<ExpiringHoldsResponse> {
  const params = new URLSearchParams();
  params.set('organization_id', organizationId);
  if (hours) params.set('hours', hours.toString());

  const res = await fetch(`/api/holds/expiring?${params}`);
  if (!res.ok) throw new Error('Failed to fetch expiring holds');
  return res.json();
}

async function createHold(input: CreateHoldInput): Promise<{ hold: SpaceHold }> {
  const res = await fetch('/api/holds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create hold');
  }
  return res.json();
}

async function updateHold(id: string, input: UpdateHoldInput): Promise<{ hold: SpaceHold }> {
  const res = await fetch(`/api/holds/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to update hold');
  return res.json();
}

async function releaseHold(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/holds/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to release hold');
  return res.json();
}

async function convertHold(
  id: string,
  input: ConvertHoldInput
): Promise<{ booking: unknown; hold_released: boolean }> {
  const res = await fetch(`/api/holds/${id}/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to convert hold');
  return res.json();
}

export function useHolds(filters: HoldsFilters) {
  return useQuery({
    queryKey: ['holds', filters],
    queryFn: () => fetchHolds(filters),
    enabled: !!filters.organization_id,
  });
}

export function useHold(id: string | undefined) {
  return useQuery({
    queryKey: ['hold', id],
    queryFn: () => fetchHold(id!),
    enabled: !!id,
  });
}

export function useExpiringHolds(organizationId: string | undefined, hours?: number) {
  return useQuery({
    queryKey: ['holds', 'expiring', organizationId, hours],
    queryFn: () => fetchExpiringHolds(organizationId!, hours),
    enabled: !!organizationId,
    refetchInterval: 5 * 60 * 1000,
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

export function useUpdateHold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateHoldInput }) => updateHold(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['holds'] });
      queryClient.invalidateQueries({ queryKey: ['hold', id] });
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

export function useConvertHold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ConvertHoldInput }) => convertHold(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holds'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}
