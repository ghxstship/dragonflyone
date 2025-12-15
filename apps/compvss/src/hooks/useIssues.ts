'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// ISSUES HOOKS
// Manage production issues and tracking
// =============================================================================

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'safety' | 'logistics' | 'personnel' | 'vendor' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed';
  reported_by: string;
  assigned_to?: string;
  department: string;
  location?: string;
  created_at: string;
  updated_at: string;
  escalation_level: number;
  resolution?: string;
  production_id?: string;
}

// Fetch issues
export function useIssues(productionId?: string) {
  return useQuery({
    queryKey: ['issues', productionId],
    queryFn: async () => {
      let query = supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(i => ({
        id: i.id,
        title: i.title,
        description: i.description,
        category: i.category,
        priority: i.priority,
        status: i.status,
        reported_by: i.reported_by,
        assigned_to: i.assigned_to,
        department: i.department,
        location: i.location,
        created_at: i.created_at,
        updated_at: i.updated_at,
        escalation_level: i.escalation_level || 0,
        resolution: i.resolution,
        production_id: i.production_id,
      })) as Issue[];
    },
  });
}

// Create issue
export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (issue: Omit<Issue, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('issues')
        .insert({
          title: issue.title,
          description: issue.description,
          category: issue.category,
          priority: issue.priority,
          status: issue.status,
          reported_by: issue.reported_by,
          assigned_to: issue.assigned_to,
          department: issue.department,
          location: issue.location,
          escalation_level: issue.escalation_level,
          production_id: issue.production_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });
}

// Update issue status
export function useUpdateIssueStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, escalation_level, resolution }: { id: string; status: Issue['status']; escalation_level?: number; resolution?: string }) => {
      const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (escalation_level !== undefined) updates.escalation_level = escalation_level;
      if (resolution) updates.resolution = resolution;

      const { data, error } = await supabase
        .from('issues')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });
}

// Delete issue
export function useDeleteIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('issues').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });
}
