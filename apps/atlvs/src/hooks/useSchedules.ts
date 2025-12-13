'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Schedule {
  id: string;
  organization_id: string;
  event_id?: string;
  production_id?: string;
  name: string;
  description?: string;
  schedule_type: 'production' | 'rehearsal' | 'load_in' | 'load_out' | 'show' | 'meeting' | 'other';
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at?: string;
}

interface ScheduleFilters {
  organization_id?: string;
  event_id?: string;
  production_id?: string;
  status?: string;
  schedule_type?: string;
}

export function useSchedules(filters?: ScheduleFilters) {
  return useQuery({
    queryKey: ['schedules', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.organization_id) params.append('organization_id', filters.organization_id);
      if (filters?.event_id) params.append('event_id', filters.event_id);
      if (filters?.production_id) params.append('production_id', filters.production_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.schedule_type) params.append('schedule_type', filters.schedule_type);

      const response = await fetch(`/api/schedules?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch schedules');
      }
      const data = await response.json();
      return data.schedules || [];
    },
  });
}

export function useSchedule(id: string) {
  return useQuery({
    queryKey: ['schedules', id],
    queryFn: async () => {
      const response = await fetch(`/api/schedules/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch schedule');
      }
      const data = await response.json();
      return data.schedule;
    },
    enabled: !!id,
  });
}

interface CreateScheduleInput {
  organization_id: string;
  event_id?: string;
  production_id?: string;
  name: string;
  description?: string;
  schedule_type?: string;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  status?: string;
  notes?: string;
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateScheduleInput) => {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create schedule');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Schedule> & { id: string }) => {
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update schedule');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedules', variables.id] });
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete schedule');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
}
