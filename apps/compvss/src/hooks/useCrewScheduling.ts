import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CrewShift {
  id: string;
  crew_member_id: string;
  crew_member_name: string;
  booking_id?: string;
  booking_name?: string;
  event_id?: string;
  event_name?: string;
  role: string;
  department?: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  status: 'scheduled' | 'confirmed' | 'checked_in' | 'checked_out' | 'no_show' | 'cancelled';
  check_in_time?: string;
  check_out_time?: string;
  actual_hours?: number;
  hourly_rate?: number;
  total_pay?: number;
  notes?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface CrewAvailability {
  crew_member_id: string;
  crew_member_name: string;
  date: string;
  status: 'available' | 'unavailable' | 'partial' | 'pending';
  available_from?: string;
  available_until?: string;
  reason?: string;
  recurring?: {
    days_of_week: number[];
    start_time: string;
    end_time: string;
  };
}

export interface ScheduleFilters {
  start_date: string;
  end_date: string;
  crew_member_id?: string;
  booking_id?: string;
  department?: string;
  status?: CrewShift['status'];
}

export interface CreateShiftInput {
  crew_member_id: string;
  booking_id?: string;
  event_id?: string;
  role: string;
  department?: string;
  start_time: string;
  end_time: string;
  break_minutes?: number;
  hourly_rate?: number;
  notes?: string;
  location?: string;
}

async function fetchCrewSchedule(filters: ScheduleFilters): Promise<{
  shifts: CrewShift[];
  total_hours: number;
  total_cost: number;
  by_department: Record<string, { shifts: number; hours: number; cost: number }>;
}> {
  const params = new URLSearchParams();
  params.set('start_date', filters.start_date);
  params.set('end_date', filters.end_date);
  if (filters.crew_member_id) params.set('crew_member_id', filters.crew_member_id);
  if (filters.booking_id) params.set('booking_id', filters.booking_id);
  if (filters.department) params.set('department', filters.department);
  if (filters.status) params.set('status', filters.status);

  const response = await fetch(`/api/crew/schedule?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch crew schedule');
  }
  return response.json();
}

async function fetchCrewAvailability(dateRange: { start: string; end: string }, crewMemberIds?: string[]): Promise<{
  availability: CrewAvailability[];
}> {
  const params = new URLSearchParams();
  params.set('start', dateRange.start);
  params.set('end', dateRange.end);
  if (crewMemberIds?.length) params.set('crew_ids', crewMemberIds.join(','));

  const response = await fetch(`/api/crew/availability?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch availability');
  }
  return response.json();
}

async function createShift(input: CreateShiftInput): Promise<CrewShift> {
  const response = await fetch('/api/crew/shifts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create shift');
  }
  return response.json();
}

async function updateShift(input: { id: string } & Partial<CreateShiftInput>): Promise<CrewShift> {
  const { id, ...data } = input;
  const response = await fetch(`/api/crew/shifts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update shift');
  }
  return response.json();
}

async function deleteShift(id: string): Promise<void> {
  const response = await fetch(`/api/crew/shifts/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete shift');
  }
}

async function checkInShift(shiftId: string): Promise<CrewShift> {
  const response = await fetch(`/api/crew/shifts/${shiftId}/check-in`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to check in');
  }
  return response.json();
}

async function checkOutShift(shiftId: string, notes?: string): Promise<CrewShift> {
  const response = await fetch(`/api/crew/shifts/${shiftId}/check-out`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
  if (!response.ok) {
    throw new Error('Failed to check out');
  }
  return response.json();
}

async function setAvailability(input: Omit<CrewAvailability, 'crew_member_name'>): Promise<CrewAvailability> {
  const response = await fetch('/api/crew/availability', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to set availability');
  }
  return response.json();
}

export function useCrewSchedule(filters: ScheduleFilters) {
  return useQuery({
    queryKey: ['crew-schedule', filters],
    queryFn: () => fetchCrewSchedule(filters),
    enabled: !!filters.start_date && !!filters.end_date,
  });
}

export function useCrewAvailability(dateRange: { start: string; end: string }, crewMemberIds?: string[]) {
  return useQuery({
    queryKey: ['crew-availability', dateRange, crewMemberIds],
    queryFn: () => fetchCrewAvailability(dateRange, crewMemberIds),
    enabled: !!dateRange.start && !!dateRange.end,
  });
}

export function useCreateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-schedule'] });
    },
  });
}

export function useUpdateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-schedule'] });
    },
  });
}

export function useDeleteShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-schedule'] });
    },
  });
}

export function useCheckInShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkInShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-schedule'] });
    },
  });
}

export function useCheckOutShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shiftId, notes }: { shiftId: string; notes?: string }) => checkOutShift(shiftId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-schedule'] });
    },
  });
}

export function useSetAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-availability'] });
    },
  });
}
