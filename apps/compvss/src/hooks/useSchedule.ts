'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Schema: Aligned with Supabase schedule_phases table schema
interface SchedulePhase {
  id: string;
  schedule_id: string;
  phase_name: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  phase_order?: number | null;
  color?: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | null;
  created_at: string | null;
  updated_at: string | null;
}

interface ScheduleFilters {
  schedule_id?: string;
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
        .order('phase_order', { ascending: true });

      if (filters?.schedule_id) {
        query = query.eq('schedule_id', filters.schedule_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SchedulePhase[];
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
      return data as SchedulePhase;
    },
    enabled: !!id,
  });
}

// Schema: Input type for creating schedule phases
interface CreateSchedulePhaseInput {
  schedule_id: string;
  phase_name: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  phase_order?: number | null;
  color?: string | null;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | null;
}

// Create schedule phase
export function useCreateSchedulePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (phase: CreateSchedulePhaseInput) => {
      const { data, error } = await supabase
        .from('schedule_phases')
        .insert(phase)
        .select()
        .single();

      if (error) throw error;
      return data as SchedulePhase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
}

// Schema: Input type for updating schedule phases
interface UpdateSchedulePhaseInput {
  id: string;
  phase_name?: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  phase_order?: number | null;
  color?: string | null;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | null;
}

// Update schedule phase
export function useUpdateSchedulePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateSchedulePhaseInput) => {
      const { data, error } = await supabase
        .from('schedule_phases')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as SchedulePhase;
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

// =============================================================================
// SCHEDULE PAGE HOOKS (API-based with demo fallback)
// =============================================================================

export interface ScheduleItem {
  id: string;
  title: string;
  type: string;
  start_time: string;
  end_time: string;
  status: string;
  priority: string;
  crew_roles_required?: string[];
  assignments?: Array<{
    id: string;
    crew_member?: { id: string; full_name: string; role: string };
    status: string;
  }>;
}

export interface ScheduleSummary {
  total: number;
  by_type: Record<string, number>;
  by_status: {
    scheduled: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
}

const DEFAULT_SUMMARY: ScheduleSummary = {
  total: 0,
  by_type: {},
  by_status: { scheduled: 0, in_progress: 0, completed: 0, cancelled: 0 },
};

export function useSchedulePageData() {
  const scheduleQuery = useQuery({
    queryKey: ['schedule-page'],
    queryFn: async () => {
      const response = await fetch('/api/schedule');
      if (!response.ok) {
        throw new Error('Failed to fetch schedule');
      }
      const data = await response.json();
      return {
        items: data.items || data.schedule || [],
        summary: data.summary || DEFAULT_SUMMARY,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const data = scheduleQuery.data || { items: [], summary: DEFAULT_SUMMARY };

  return {
    items: data.items,
    summary: data.summary,
    isLoading: scheduleQuery.isLoading,
    error: scheduleQuery.error,
    refetch: scheduleQuery.refetch,
  };
}
