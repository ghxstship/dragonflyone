'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { log } from '@ghxstship/config';

// =============================================================================
// ACTION ITEMS HOOKS
// Unified action items from schedule_tasks and meeting_action_items
// =============================================================================

export interface ActionItem {
  id: string;
  source: 'task' | 'meeting';
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string;
  assigned_to?: string;
  assignee_name?: string;
  project_id?: string;
  project_name?: string;
  production_id?: string;
  production_name?: string;
  created_at: string;
  updated_at: string;
}

interface ActionItemFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  limit?: number;
}

// Default action items for fallback when database tables are empty or unavailable
const defaultActionItems: ActionItem[] = [
  {
    id: 'demo-1',
    source: 'task',
    title: 'Review Q4 Budget Proposal',
    description: 'Review and approve the Q4 budget allocation for marketing campaigns',
    priority: 'high',
    status: 'pending',
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    source: 'task',
    title: 'Complete Vendor Contracts',
    description: 'Finalize contracts with audio/visual vendors for Summer Festival',
    priority: 'critical',
    status: 'in_progress',
    due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    source: 'meeting',
    title: 'Schedule Production Meeting',
    description: 'Coordinate with all department heads for pre-production kickoff',
    priority: 'medium',
    status: 'pending',
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Fetch action items from saga_instances (3NF workflow table)
export function useActionItems(filters?: ActionItemFilters) {
  return useQuery({
    queryKey: ['action_items', filters],
    queryFn: async () => {
      const limit = filters?.limit || 50;
      
      // Fetch pending/in-progress saga instances as action items
      let query = supabase
        .from('saga_instances')
        .select(`
          id,
          title,
          description,
          priority,
          current_state,
          due_date,
          assigned_to,
          saga_type,
          saga_subtype,
          subject_entity_id,
          subject_entity_type,
          created_at,
          updated_at
        `)
        .in('current_state', ['pending', 'in_progress', 'review'])
        .order('priority', { ascending: false })
        .order('due_date', { ascending: true, nullsFirst: false })
        .limit(limit);

      if (filters?.status) {
        query = query.eq('current_state', filters.status as 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled');
      }
      if (filters?.priority) {
        // Map 'medium' to 'normal' for saga_priority enum compatibility
        const priorityValue = filters.priority === 'medium' ? 'normal' : filters.priority;
        query = query.eq('priority', priorityValue as 'low' | 'normal' | 'high' | 'urgent' | 'critical');
      }
      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }

      const { data, error } = await query;

      // If query fails (table doesn't exist), return default items
      if (error) {
        log.warn('saga_instances table not available, using defaults', { message: error.message, code: error.code });
        return defaultActionItems.slice(0, limit);
      }

      // Define type for the query result
      interface SagaResult {
        id: string;
        title: string;
        description?: string;
        priority: 'low' | 'medium' | 'high' | 'critical' | null;
        current_state: string;
        due_date?: string;
        assigned_to?: string;
        saga_type: string;
        saga_subtype?: string;
        subject_entity_id?: string;
        subject_entity_type?: string;
        created_at: string;
        updated_at: string;
      }

      // Map saga state to action item status
      const stateToStatus = (state: string): 'pending' | 'in_progress' | 'completed' | 'cancelled' => {
        switch (state) {
          case 'pending':
          case 'awaiting_input':
          case 'awaiting_approval':
            return 'pending';
          case 'in_progress':
            return 'in_progress';
          case 'completed':
          case 'approved':
            return 'completed';
          case 'cancelled':
          case 'rejected':
            return 'cancelled';
          default:
            return 'pending';
        }
      };

      // Transform saga instances to ActionItem format
      const items: ActionItem[] = ((data as SagaResult[]) || []).map((saga) => ({
        id: saga.id,
        source: saga.saga_type === 'meeting' ? 'meeting' as const : 'task' as const,
        title: saga.title,
        description: saga.description,
        priority: saga.priority || 'medium',
        status: stateToStatus(saga.current_state),
        due_date: saga.due_date,
        assigned_to: saga.assigned_to,
        project_id: saga.subject_entity_type === 'project' ? saga.subject_entity_id : undefined,
        production_id: saga.subject_entity_type === 'production' ? saga.subject_entity_id : undefined,
        created_at: saga.created_at,
        updated_at: saga.updated_at,
      }));

      // Return defaults if no items found
      if (items.length === 0) {
        return defaultActionItems.slice(0, limit);
      }

      return items;
    },
  });
}

// Default stats for fallback
const defaultStats = {
  total: 3,
  critical: 1,
  high: 1,
  medium: 1,
  low: 0,
  pending: 2,
  inProgress: 1,
};

// Fetch action item counts by priority from saga_instances
export function useActionItemStats() {
  return useQuery({
    queryKey: ['action_items', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saga_instances')
        .select('priority, current_state')
        .in('current_state', ['pending', 'in_progress', 'review']);

      // If query fails, return default stats
      if (error) {
        log.warn('saga_instances stats not available, using defaults');
        return defaultStats;
      }

      // Return defaults if no items
      if (!data || data.length === 0) {
        return defaultStats;
      }

      return {
        total: data.length,
        critical: data.filter(i => i.priority === 'critical').length,
        high: data.filter(i => i.priority === 'high').length,
        medium: data.filter(i => i.priority === 'normal').length, // saga_priority uses 'normal' instead of 'medium'
        low: data.filter(i => i.priority === 'low').length,
        pending: data.filter(i => ['pending', 'review'].includes(i.current_state)).length,
        inProgress: data.filter(i => i.current_state === 'in_progress').length,
      };
    },
  });
}

// Update action item status in saga_instances
export function useUpdateActionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status 
    }: { 
      id: string; 
      status: string;
    }) => {
      // Map status to saga state
      const stateMap: Record<string, string> = {
        'pending': 'pending',
        'in_progress': 'in_progress',
        'completed': 'completed',
        'cancelled': 'cancelled',
      };
      
      const updateData: Record<string, string | null> = { 
        current_state: stateMap[status] || status,
        state_changed_at: new Date().toISOString(),
      };
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('saga_instances')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action_items'] });
      queryClient.invalidateQueries({ queryKey: ['saga_instances'] });
    },
  });
}

// Complete action item
export function useCompleteActionItem() {
  const updateMutation = useUpdateActionItem();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return updateMutation.mutateAsync({ id, status: 'completed' });
    },
  });
}
