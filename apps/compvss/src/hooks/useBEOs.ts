'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface BEOSection {
  event_info?: {
    event_name?: string;
    event_type?: string;
    client_name?: string;
    client_phone?: string;
    client_email?: string;
    account_manager?: string;
  };
  timeline?: Array<{
    time: string;
    activity: string;
    location?: string;
    notes?: string;
  }>;
  room_setup?: {
    layout?: string;
    capacity?: number;
    tables?: number;
    chairs?: number;
    stage?: boolean;
    dance_floor?: boolean;
    notes?: string;
  };
  food_beverage?: {
    menu_type?: string;
    courses?: Array<{ name: string; description: string }>;
    beverages?: string[];
    service_style?: string;
    dietary_notes?: string;
  };
  av_tech?: {
    sound?: boolean;
    lighting?: boolean;
    projection?: boolean;
    microphones?: number;
    screens?: number;
    notes?: string;
  };
  dietary?: Array<{
    restriction: string;
    count: number;
  }>;
  staff?: Array<{
    role: string;
    name?: string;
    quantity: number;
    start_time?: string;
    end_time?: string;
  }>;
  vendor_contacts?: Array<{
    company: string;
    contact_name: string;
    phone?: string;
    email?: string;
    role: string;
  }>;
}

export interface BEO {
  id: string;
  organization_id: string;
  booking_id?: string;
  event_id?: string;
  template_id?: string;
  beo_number: string;
  name: string;
  version: number;
  status: 'draft' | 'pending_review' | 'approved' | 'distributed' | 'executed' | 'archived';
  event_date: string;
  event_start_time?: string;
  event_end_time?: string;
  venue_name?: string;
  room_name?: string;
  guest_count?: number;
  sections: BEOSection;
  notes?: string;
  internal_notes?: string;
  approved_by?: string;
  approved_at?: string;
  distributed_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  booking?: {
    id: string;
    booking_number: string;
    event_name?: string;
  };
  event?: {
    id: string;
    name: string;
  };
}

export interface BEOFilters {
  status?: string;
  event_date_from?: string;
  event_date_to?: string;
}

export interface CreateBEOInput {
  organization_id: string;
  booking_id?: string;
  event_id?: string;
  template_id?: string;
  name: string;
  event_date: string;
  event_start_time?: string;
  event_end_time?: string;
  venue_name?: string;
  room_name?: string;
  guest_count?: number;
  sections?: BEOSection;
  notes?: string;
}

export interface UpdateBEOInput {
  name?: string;
  event_date?: string;
  event_start_time?: string;
  event_end_time?: string;
  venue_name?: string;
  room_name?: string;
  guest_count?: number;
  sections?: BEOSection;
  notes?: string;
  internal_notes?: string;
  status?: BEO['status'];
}

async function fetchBEOs(filters?: BEOFilters): Promise<{ beos: BEO[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.event_date_from) params.set('event_date_from', filters.event_date_from);
  if (filters?.event_date_to) params.set('event_date_to', filters.event_date_to);

  const res = await fetch(`/api/beos?${params}`);
  if (!res.ok) throw new Error('Failed to fetch BEOs');
  return res.json();
}

async function fetchBEO(id: string): Promise<{ beo: BEO }> {
  const res = await fetch(`/api/beos/${id}`);
  if (!res.ok) throw new Error('Failed to fetch BEO');
  return res.json();
}

async function createBEO(input: CreateBEOInput): Promise<{ beo: BEO }> {
  const res = await fetch('/api/beos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create BEO');
  }
  return res.json();
}

async function updateBEO(id: string, input: UpdateBEOInput): Promise<{ beo: BEO }> {
  const res = await fetch(`/api/beos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to update BEO');
  return res.json();
}

async function deleteBEO(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/beos/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete BEO');
  return res.json();
}

async function approveBEO(id: string): Promise<{ beo: BEO }> {
  const res = await fetch(`/api/beos/${id}/approve`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to approve BEO');
  return res.json();
}

async function distributeBEO(id: string, recipients: string[]): Promise<{ success: boolean }> {
  const res = await fetch(`/api/beos/${id}/distribute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipients }),
  });
  if (!res.ok) throw new Error('Failed to distribute BEO');
  return res.json();
}

export function useBEOs(filters?: BEOFilters) {
  return useQuery({
    queryKey: ['beos', filters],
    queryFn: () => fetchBEOs(filters),
  });
}

export function useBEO(id: string | undefined) {
  return useQuery({
    queryKey: ['beo', id],
    queryFn: () => fetchBEO(id!),
    enabled: !!id,
  });
}

export function useCreateBEO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBEO,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beos'] });
    },
  });
}

export function useUpdateBEO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBEOInput }) => updateBEO(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['beos'] });
      queryClient.setQueryData(['beo', data.beo.id], data);
    },
  });
}

export function useDeleteBEO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBEO,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beos'] });
    },
  });
}

export function useApproveBEO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveBEO,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['beos'] });
      queryClient.setQueryData(['beo', data.beo.id], data);
    },
  });
}

export function useDistributeBEO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, recipients }: { id: string; recipients: string[] }) => 
      distributeBEO(id, recipients),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['beo', variables.id] });
    },
  });
}
