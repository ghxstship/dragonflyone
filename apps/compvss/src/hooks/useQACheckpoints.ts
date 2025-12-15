'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// QA CHECKPOINTS HOOKS
// Manage QA checkpoints and sign-offs
// =============================================================================

export interface QACheckpoint {
  id: string;
  name: string;
  department: 'Audio' | 'Lighting' | 'Video' | 'Staging' | 'Rigging' | 'Safety';
  phase: 'Load-In' | 'Setup' | 'Tech Rehearsal' | 'Show Ready' | 'Strike';
  status: 'Pending' | 'In Progress' | 'Passed' | 'Failed' | 'Waived';
  assignee?: string;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
  items: { id: string; description: string; checked: boolean; critical: boolean }[];
}

// Fetch QA checkpoints
export function useQACheckpoints() {
  return useQuery({
    queryKey: ['qa-checkpoints'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qa_checkpoints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(c => ({
        id: c.id,
        name: c.checkpoint_name || c.description || 'Untitled',
        department: (c.category as QACheckpoint['department']) || 'Safety',
        phase: (c.stage as QACheckpoint['phase']) || 'Setup',
        status: c.passed ? 'Passed' : c.completed_date ? 'In Progress' : 'Pending',
        assignee: c.responsible_party,
        completedAt: c.completed_date,
        completedBy: c.verified_by,
        notes: c.notes,
        items: Array.isArray(c.criteria) ? c.criteria : [],
      })) as QACheckpoint[];
    },
  });
}

// Sign off checkpoint
export function useSignOffCheckpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, completedBy, notes }: { id: string; completedBy: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('qa_checkpoints')
        .update({
          passed: true,
          completed_date: new Date().toISOString(),
          verified_by: completedBy,
          notes,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qa-checkpoints'] });
    },
  });
}
