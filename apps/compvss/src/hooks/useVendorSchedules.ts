'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface VendorSchedule {
  id: string;
  organization_id: string;
  booking_id?: string;
  vendor_profile_id: string;
  schedule_type: 'load_in' | 'load_out' | 'setup' | 'breakdown' | 'service' | 'standby';
  start_time: string;
  end_time: string;
  location?: string;
  access_point?: string;
  access_instructions?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  crew_count: number;
  equipment_notes?: string;
  special_requirements?: string;
  confirmed_at?: string;
  confirmed_by?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  vendor?: {
    id: string;
    name: string;
    company_name?: string;
  };
  booking?: {
    id: string;
    booking_number: string;
    event_name?: string;
    event_date?: string;
  };
}

export interface VendorCommunication {
  id: string;
  organization_id: string;
  booking_id?: string;
  vendor_profile_id: string;
  schedule_id?: string;
  channel: 'email' | 'sms' | 'phone' | 'in_app' | 'portal';
  direction: 'outbound' | 'inbound';
  subject?: string;
  message: string;
  sent_by?: string;
  sent_at: string;
  read_at?: string;
  responded_at?: string;
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'failed' | 'bounced';
  attachments?: unknown[];
  metadata?: Record<string, unknown>;
  created_at: string;
}

interface ScheduleFilters {
  booking_id?: string;
  vendor_id?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  type?: string;
}

interface SchedulesResponse {
  schedules: VendorSchedule[];
  grouped: Record<string, VendorSchedule[]>;
  count: number;
}

interface CreateScheduleInput {
  booking_id?: string;
  vendor_profile_id: string;
  schedule_type: VendorSchedule['schedule_type'];
  start_time: string;
  end_time: string;
  location?: string;
  access_point?: string;
  access_instructions?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  crew_count?: number;
  equipment_notes?: string;
  special_requirements?: string;
}

interface UpdateScheduleInput {
  schedule_type?: VendorSchedule['schedule_type'];
  start_time?: string;
  end_time?: string;
  location?: string;
  access_point?: string;
  access_instructions?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  status?: VendorSchedule['status'];
  crew_count?: number;
  equipment_notes?: string;
  special_requirements?: string;
}

async function fetchSchedules(filters?: ScheduleFilters): Promise<SchedulesResponse> {
  const params = new URLSearchParams();
  if (filters?.booking_id) params.set('booking_id', filters.booking_id);
  if (filters?.vendor_id) params.set('vendor_id', filters.vendor_id);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.start_date) params.set('start_date', filters.start_date);
  if (filters?.end_date) params.set('end_date', filters.end_date);
  if (filters?.type) params.set('type', filters.type);

  const res = await fetch(`/api/vendor-schedules?${params}`);
  if (!res.ok) throw new Error('Failed to fetch schedules');
  return res.json();
}

async function fetchSchedule(id: string): Promise<{ schedule: VendorSchedule }> {
  const res = await fetch(`/api/vendor-schedules/${id}`);
  if (!res.ok) throw new Error('Failed to fetch schedule');
  return res.json();
}

async function createSchedule(input: CreateScheduleInput): Promise<{ schedule: VendorSchedule }> {
  const res = await fetch('/api/vendor-schedules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create schedule');
  }
  return res.json();
}

async function updateSchedule(id: string, input: UpdateScheduleInput): Promise<{ schedule: VendorSchedule }> {
  const res = await fetch(`/api/vendor-schedules/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to update schedule');
  return res.json();
}

async function confirmSchedule(id: string): Promise<{ schedule: VendorSchedule }> {
  const res = await fetch(`/api/vendor-schedules/${id}/confirm`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to confirm schedule');
  return res.json();
}

async function cancelSchedule(id: string, reason?: string): Promise<void> {
  const res = await fetch(`/api/vendor-schedules/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error('Failed to cancel schedule');
}

async function sendNotification(scheduleId: string, channel: 'email' | 'sms' | 'both'): Promise<void> {
  const res = await fetch(`/api/vendor-schedules/${scheduleId}/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel }),
  });
  if (!res.ok) throw new Error('Failed to send notification');
}

export function useVendorSchedules(filters?: ScheduleFilters) {
  return useQuery({
    queryKey: ['vendor-schedules', filters],
    queryFn: () => fetchSchedules(filters),
  });
}

export function useVendorSchedule(id: string | undefined) {
  return useQuery({
    queryKey: ['vendor-schedule', id],
    queryFn: () => fetchSchedule(id!),
    enabled: !!id,
  });
}

export function useCreateVendorSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-schedules'] });
    },
  });
}

export function useUpdateVendorSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: UpdateScheduleInput & { id: string }) =>
      updateSchedule(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-schedule', variables.id] });
    },
  });
}

export function useConfirmVendorSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmSchedule,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-schedule', id] });
    },
  });
}

export function useCancelVendorSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelSchedule(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-schedules'] });
    },
  });
}

export function useSendScheduleNotification() {
  return useMutation({
    mutationFn: ({ scheduleId, channel }: { scheduleId: string; channel: 'email' | 'sms' | 'both' }) =>
      sendNotification(scheduleId, channel),
  });
}

// Hook for booking-specific schedules
export function useBookingVendorSchedules(bookingId: string | undefined) {
  return useVendorSchedules(bookingId ? { booking_id: bookingId } : undefined);
}

// Hook for vendor-specific schedules
export function useVendorSchedulesByVendor(vendorId: string | undefined) {
  return useVendorSchedules(vendorId ? { vendor_id: vendorId } : undefined);
}

// =============================================================================
// VENDOR COMMUNICATIONS HOOKS
// =============================================================================

interface CommunicationsResponse {
  communications: Array<{
    id: string;
    vendor_name: string;
    vendor_email: string;
    booking_number?: string;
    event_name?: string;
    message_type: 'email' | 'sms' | 'portal';
    subject: string;
    message: string;
    sent_at: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
  }>;
  count: number;
}


export function useVendorCommunications(filters?: { booking_id?: string; vendor_id?: string }) {
  return useQuery({
    queryKey: ['vendor-communications', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.booking_id) params.set('booking_id', filters.booking_id);
      if (filters?.vendor_id) params.set('vendor_id', filters.vendor_id);

      const res = await fetch(`/api/vendor-communications?${params}`);
      if (!res.ok) {
        throw new Error('Failed to fetch vendor communications');
      }
      return res.json() as Promise<CommunicationsResponse>;
    },
  });
}

interface SendMessageInput {
  vendor_id: string;
  subject: string;
  message: string;
  channel?: 'email' | 'sms' | 'portal';
  booking_id?: string;
}

export function useSendVendorMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SendMessageInput) => {
      const res = await fetch('/api/vendor-communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to send message');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-communications'] });
    },
  });
}
