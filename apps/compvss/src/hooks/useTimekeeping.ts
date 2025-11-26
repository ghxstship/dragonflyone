'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface TimeEntry {
  id: string;
  user_id: string;
  project_id: string;
  date: string;
  hours_regular: number;
  hours_overtime: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

interface TimeEntryFilters {
  status?: string;
  projectId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

// Fetch all time entries with optional filters
export function useTimekeeping(filters?: TimeEntryFilters) {
  return useQuery({
    queryKey: ['timekeeping', filters],
    queryFn: async () => {
      let query = supabase
        .from('time_entries')
        .select(`
          *,
          user:users(id, email, full_name),
          project:projects(id, name)
        `)
        .order('date', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.projectId) {
        query = query.eq('project_id', filters.projectId);
      }
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown) as TimeEntry[];
    },
  });
}

// Fetch a single time entry
export function useTimeEntry(id: string) {
  return useQuery({
    queryKey: ['timekeeping', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          user:users(id, email, full_name),
          project:projects(id, name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return (data as unknown) as TimeEntry;
    },
    enabled: !!id,
  });
}

// Create a new time entry
export function useCreateTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (timeEntry: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('time_entries')
        .insert(timeEntry)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timekeeping'] });
    },
  });
}

// Update a time entry
export function useUpdateTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TimeEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from('time_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timekeeping'] });
    },
  });
}

// Approve a time entry
export function useApproveTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('time_entries')
        .update({ status: 'approved' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timekeeping'] });
    },
  });
}

// Delete a time entry
export function useDeleteTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timekeeping'] });
    },
  });
}
