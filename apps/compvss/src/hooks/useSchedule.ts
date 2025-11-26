'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface SchedulePhase {
  id: string;
  project_id?: string;
  name: string;
  start_time?: string;
  end_time?: string;
  crew_count?: number;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  progress?: number;
  created_at: string;
  updated_at: string;
}

interface ScheduleFilters {
  project_id?: string;
  status?: string;
}

// Fetch all schedule phases
export function useSchedule(filters?: ScheduleFilters) {
  return useQuery({
    queryKey: ['schedule', filters],
    queryFn: async () => {
      let query = supabase
        .from('schedule_phases')
        .select('*')
        .order('start_time', { ascending: true });

      if (filters?.project_id) {
        query = query.eq('project_id', filters.project_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown) as SchedulePhase[];
    },
  });
}

// Fetch single schedule phase
export function useSchedulePhase(id: string) {
  return useQuery({
    queryKey: ['schedule', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedule_phases')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return (data as unknown) as SchedulePhase;
    },
    enabled: !!id,
  });
}

// Create schedule phase
export function useCreateSchedulePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (phase: Omit<SchedulePhase, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('schedule_phases')
        .insert(phase)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
}

// Update schedule phase
export function useUpdateSchedulePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SchedulePhase> & { id: string }) => {
      const { data, error } = await supabase
        .from('schedule_phases')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
}

// Delete schedule phase
export function useDeleteSchedulePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('schedule_phases').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
}
