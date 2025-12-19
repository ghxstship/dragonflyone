import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface LoadInSlot {
  id: string;
  booking_id: string;
  vendor_id?: string;
  vendor_name?: string;
  crew_team?: string;
  slot_type: 'load_in' | 'setup' | 'sound_check' | 'rehearsal' | 'load_out';
  start_time: string;
  end_time: string;
  location: string;
  dock_number?: string;
  vehicle_type?: string;
  vehicle_count?: number;
  contact_name?: string;
  contact_phone?: string;
  equipment_list?: string[];
  special_requirements?: string;
  status: 'scheduled' | 'arrived' | 'in_progress' | 'completed' | 'no_show' | 'cancelled';
  arrival_time?: string;
  completion_time?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LoadInSchedule {
  booking_id: string;
  event_name: string;
  event_date: string;
  venue_name: string;
  venue_address: string;
  loading_docks: Array<{
    dock_number: string;
    capacity: string;
    restrictions?: string;
  }>;
  slots: LoadInSlot[];
  summary: {
    total_slots: number;
    scheduled: number;
    in_progress: number;
    completed: number;
    by_type: Record<string, number>;
  };
}

export interface CreateSlotInput {
  booking_id: string;
  vendor_id?: string;
  crew_team?: string;
  slot_type: LoadInSlot['slot_type'];
  start_time: string;
  end_time: string;
  location: string;
  dock_number?: string;
  vehicle_type?: string;
  vehicle_count?: number;
  contact_name?: string;
  contact_phone?: string;
  equipment_list?: string[];
  special_requirements?: string;
}

async function fetchLoadInSchedule(bookingId: string): Promise<LoadInSchedule> {
  const response = await fetch(`/api/load-in-schedules/${bookingId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch load-in schedule');
  }
  return response.json();
}

async function createSlot(input: CreateSlotInput): Promise<LoadInSlot> {
  const response = await fetch('/api/load-in-slots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create slot');
  }
  return response.json();
}

async function updateSlot(input: { id: string } & Partial<CreateSlotInput>): Promise<LoadInSlot> {
  const { id, ...data } = input;
  const response = await fetch(`/api/load-in-slots/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update slot');
  }
  return response.json();
}

async function deleteSlot(id: string): Promise<void> {
  const response = await fetch(`/api/load-in-slots/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete slot');
  }
}

async function markArrival(slotId: string): Promise<LoadInSlot> {
  const response = await fetch(`/api/load-in-slots/${slotId}/arrived`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to mark arrival');
  }
  return response.json();
}

async function markComplete(slotId: string, notes?: string): Promise<LoadInSlot> {
  const response = await fetch(`/api/load-in-slots/${slotId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
  if (!response.ok) {
    throw new Error('Failed to mark complete');
  }
  return response.json();
}

async function checkConflicts(input: { bookingId: string; startTime: string; endTime: string; dockNumber?: string; excludeSlotId?: string }): Promise<{
  has_conflicts: boolean;
  conflicts: Array<{ slot_id: string; vendor_name: string; time_overlap: string }>;
}> {
  const response = await fetch('/api/load-in-slots/check-conflicts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error('Failed to check conflicts');
  }
  return response.json();
}

export function useLoadInSchedule(bookingId: string) {
  return useQuery({
    queryKey: ['load-in-schedule', bookingId],
    queryFn: () => fetchLoadInSchedule(bookingId),
    enabled: !!bookingId,
  });
}

export function useCreateLoadInSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSlot,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['load-in-schedule', data.booking_id] });
    },
  });
}

export function useUpdateLoadInSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSlot,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['load-in-schedule', data.booking_id] });
    },
  });
}

export function useDeleteLoadInSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['load-in-schedule'] });
    },
  });
}

export function useMarkSlotArrival() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markArrival,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['load-in-schedule', data.booking_id] });
    },
  });
}

export function useMarkSlotComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slotId, notes }: { slotId: string; notes?: string }) => markComplete(slotId, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['load-in-schedule', data.booking_id] });
    },
  });
}

export function useCheckLoadInConflicts() {
  return useMutation({
    mutationFn: checkConflicts,
  });
}
