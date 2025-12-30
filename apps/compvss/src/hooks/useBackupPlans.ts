'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// BACKUP PLANS HOOKS
// Manage contingency and backup plan documentation
// =============================================================================

export interface BackupPlan {
  id: string;
  name: string;
  category: 'Weather' | 'Technical' | 'Staffing' | 'Vendor' | 'Venue' | 'Safety';
  project: string;
  project_id?: string;
  triggerCondition: string;
  steps: string[];
  owner: string;
  status: 'Active' | 'Draft' | 'Archived';
  lastUpdated: string;
  created_at?: string;
  updated_at?: string;
}

// Fetch all backup plans
export function useBackupPlans(projectId?: string) {
  return useQuery({
    queryKey: ['backup-plans', projectId],
    queryFn: async () => {
      let query = supabase
        .from('legend_documents')
        .select('*')
        .order('name', { ascending: true });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        project: p.project_name || 'Unknown',
        project_id: p.project_id,
        triggerCondition: p.trigger_condition,
        steps: p.steps || [],
        owner: p.owner,
        status: p.status,
        lastUpdated: p.updated_at?.split('T')[0] || '',
        created_at: p.created_at,
        updated_at: p.updated_at,
      })) as BackupPlan[];
    },
  });
}

// Create backup plan
export function useCreateBackupPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: Omit<BackupPlan, 'id' | 'created_at' | 'updated_at' | 'lastUpdated'>) => {
      const { data, error } = await supabase
        .from('legend_documents')
        .insert({
          name: plan.name,
          category: plan.category,
          project_name: plan.project,
          project_id: plan.project_id,
          trigger_condition: plan.triggerCondition,
          steps: plan.steps,
          owner: plan.owner,
          status: plan.status,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-plans'] });
    },
  });
}

// Update backup plan
export function useUpdateBackupPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BackupPlan> & { id: string }) => {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.project) dbUpdates.project_name = updates.project;
      if (updates.triggerCondition) dbUpdates.trigger_condition = updates.triggerCondition;
      if (updates.steps) dbUpdates.steps = updates.steps;
      if (updates.owner) dbUpdates.owner = updates.owner;
      if (updates.status) dbUpdates.status = updates.status;

      const { data, error } = await supabase
        .from('legend_documents')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-plans'] });
    },
  });
}

// Delete backup plan
export function useDeleteBackupPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('legend_documents').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-plans'] });
    },
  });
}
