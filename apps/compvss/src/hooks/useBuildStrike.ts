'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// BUILD & STRIKE HOOKS
// Manage build and strike tasks
// =============================================================================

export interface BuildStrikeTask {
  id: string;
  task: string;
  area: string;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'complete';
  priority: 'low' | 'medium' | 'high';
  production_id?: string;
}

// Fetch build/strike tasks
export function useBuildStrikeTasks(productionId?: string) {
  return useQuery({
    queryKey: ['build-strike-tasks', productionId],
    queryFn: async () => {
      let query = supabase
        .from('build_strike_tasks')
        .select('*')
        .order('priority', { ascending: false });

      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(t => ({
        id: t.id,
        task: t.task_name || t.name,
        area: t.area,
        assignedTo: t.assigned_to,
        status: t.status,
        priority: t.priority,
        production_id: t.production_id,
      })) as BuildStrikeTask[];
    },
  });
}

// Update task status
export function useUpdateBuildStrikeTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BuildStrikeTask['status'] }) => {
      const { data, error } = await supabase
        .from('build_strike_tasks')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['build-strike-tasks'] });
    },
  });
}

// Create task
export function useCreateBuildStrikeTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Omit<BuildStrikeTask, 'id'>) => {
      const { data, error } = await supabase
        .from('build_strike_tasks')
        .insert({
          task_name: task.task,
          area: task.area,
          assigned_to: task.assignedTo,
          status: task.status,
          priority: task.priority,
          production_id: task.production_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['build-strike-tasks'] });
    },
  });
}
