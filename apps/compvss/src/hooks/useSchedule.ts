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

const DEMO_SCHEDULE: ScheduleItem[] = [
  { id: 'demo-1', title: 'Load-In: Audio Equipment', type: 'load_in', start_time: new Date().toISOString(), end_time: new Date(Date.now() + 4 * 3600000).toISOString(), status: 'in_progress', priority: 'high', crew_roles_required: ['Audio Tech', 'Stagehand'], assignments: [{ id: 'a1', crew_member: { id: 'c1', full_name: 'John Smith', role: 'Audio Tech' }, status: 'confirmed' }] },
  { id: 'demo-2', title: 'Lighting Setup', type: 'setup', start_time: new Date(Date.now() + 5 * 3600000).toISOString(), end_time: new Date(Date.now() + 9 * 3600000).toISOString(), status: 'scheduled', priority: 'medium', crew_roles_required: ['Lighting Tech'] },
];

const DEMO_SCHEDULE_SUMMARY: ScheduleSummary = {
  total: 12,
  by_type: { load_in: 3, setup: 4, rehearsal: 2, show: 2, strike: 1 },
  by_status: { scheduled: 5, in_progress: 2, completed: 4, cancelled: 1 },
};

export function useSchedulePageData() {
  const scheduleQuery = useQuery({
    queryKey: ['schedule-page'],
    queryFn: async () => {
      const response = await fetch('/api/schedule');
      if (response.status === 401) {
        return { items: DEMO_SCHEDULE, summary: DEMO_SCHEDULE_SUMMARY };
      }
      if (!response.ok) {
        throw new Error('Failed to fetch schedule');
      }
      const data = await response.json();
      return {
        items: data.items || data.schedule || [],
        summary: data.summary || DEMO_SCHEDULE_SUMMARY,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const data = scheduleQuery.data || { items: [], summary: DEMO_SCHEDULE_SUMMARY };

  return {
    items: data.items,
    summary: data.summary,
    isLoading: scheduleQuery.isLoading,
    error: scheduleQuery.error,
    refetch: scheduleQuery.refetch,
  };
}
