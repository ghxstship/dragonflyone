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

// Fetch action items (combines schedule_tasks and meeting_action_items)
export function useActionItems(filters?: ActionItemFilters) {
  return useQuery({
    queryKey: ['action_items', filters],
    queryFn: async () => {
      const limit = filters?.limit || 50;
      
      // Fetch high-priority/pending schedule tasks
      let tasksQuery = supabase
        .from('schedule_tasks')
        .select(`
          id,
          title,
          description,
          priority,
          status,
          due_date,
          assigned_to,
          production_id,
          created_at,
          updated_at
        `)
        .in('status', ['pending', 'in_progress'])
        .order('priority', { ascending: false })
        .order('due_date', { ascending: true, nullsFirst: false })
        .limit(limit);

      if (filters?.status) {
        tasksQuery = tasksQuery.eq('status', filters.status);
      }
      if (filters?.priority) {
        tasksQuery = tasksQuery.eq('priority', filters.priority);
      }
      if (filters?.assignedTo) {
        tasksQuery = tasksQuery.eq('assigned_to', filters.assignedTo);
      }

      // Fetch meeting action items
      let meetingItemsQuery = supabase
        .from('meeting_action_items')
        .select(`
          id,
          description,
          priority,
          status,
          due_date,
          assigned_to,
          assigned_to_name,
          created_at,
          updated_at,
          meeting_note:meeting_notes(
            id,
            title,
            project_id
          )
        `)
        .in('status', ['pending', 'in_progress'])
        .order('priority', { ascending: false })
        .order('due_date', { ascending: true, nullsFirst: false })
        .limit(limit);

      if (filters?.status) {
        meetingItemsQuery = meetingItemsQuery.eq('status', filters.status);
      }
      if (filters?.priority) {
        meetingItemsQuery = meetingItemsQuery.eq('priority', filters.priority);
      }
      if (filters?.assignedTo) {
        meetingItemsQuery = meetingItemsQuery.eq('assigned_to', filters.assignedTo);
      }

      const [tasksResult, meetingItemsResult] = await Promise.all([
        tasksQuery,
        meetingItemsQuery,
      ]);

      // If both queries fail (tables don't exist), return default items
      if (tasksResult.error && meetingItemsResult.error) {
        log.warn('Action items tables not available, using defaults');
        return defaultActionItems.slice(0, limit);
      }

      // Define types for the query results
      interface TaskResult {
        id: string;
        title: string;
        description?: string;
        priority: 'low' | 'medium' | 'high' | 'critical';
        status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
        due_date?: string;
        assigned_to?: string;
        production_id?: string;
        created_at: string;
        updated_at: string;
      }

      interface MeetingItemResult {
        id: string;
        description: string;
        priority: 'low' | 'medium' | 'high';
        status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
        due_date?: string;
        assigned_to?: string;
        assigned_to_name?: string;
        created_at: string;
        updated_at: string;
        meeting_note?: {
          id: string;
          title: string;
          project_id?: string;
        } | null;
      }

      // Transform schedule tasks to ActionItem format
      const taskItems: ActionItem[] = (tasksResult.data as TaskResult[] || []).map((task) => ({
        id: task.id,
        source: 'task' as const,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        due_date: task.due_date,
        assigned_to: task.assigned_to,
        production_id: task.production_id,
        created_at: task.created_at,
        updated_at: task.updated_at,
      }));

      // Transform meeting action items to ActionItem format
      const meetingItems: ActionItem[] = (meetingItemsResult.data as MeetingItemResult[] || []).map((item) => ({
        id: item.id,
        source: 'meeting' as const,
        title: item.description,
        description: item.meeting_note?.title ? `From meeting: ${item.meeting_note.title}` : undefined,
        priority: item.priority,
        status: item.status,
        due_date: item.due_date,
        assigned_to: item.assigned_to,
        assignee_name: item.assigned_to_name,
        project_id: item.meeting_note?.project_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      // Combine and sort by priority and due date
      const allItems = [...taskItems, ...meetingItems].sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        // Sort by due date (nulls last)
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });

      // Return defaults if no items found
      if (allItems.length === 0) {
        return defaultActionItems.slice(0, limit);
      }

      return allItems.slice(0, limit);
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

// Fetch action item counts by priority
export function useActionItemStats() {
  return useQuery({
    queryKey: ['action_items', 'stats'],
    queryFn: async () => {
      // Get task counts
      const { data: tasks, error: tasksError } = await supabase
        .from('schedule_tasks')
        .select('priority, status')
        .in('status', ['pending', 'in_progress']);

      // Get meeting action item counts
      const { data: meetingItems, error: meetingError } = await supabase
        .from('meeting_action_items')
        .select('priority, status')
        .in('status', ['pending', 'in_progress']);

      // If both queries fail, return default stats
      if (tasksError && meetingError) {
        log.warn('Action items stats tables not available, using defaults');
        return defaultStats;
      }

      const allItems = [...(tasks || []), ...(meetingItems || [])];

      // Return defaults if no items
      if (allItems.length === 0) {
        return defaultStats;
      }

      return {
        total: allItems.length,
        critical: allItems.filter(i => i.priority === 'critical').length,
        high: allItems.filter(i => i.priority === 'high').length,
        medium: allItems.filter(i => i.priority === 'medium').length,
        low: allItems.filter(i => i.priority === 'low').length,
        pending: allItems.filter(i => i.status === 'pending').length,
        inProgress: allItems.filter(i => i.status === 'in_progress').length,
      };
    },
  });
}

// Update action item status (handles both sources)
export function useUpdateActionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      source, 
      status 
    }: { 
      id: string; 
      source: 'task' | 'meeting'; 
      status: string;
    }) => {
      const table = source === 'task' ? 'schedule_tasks' : 'meeting_action_items';
      const updateData: Record<string, string> = { status };
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['action_items'] });
      queryClient.invalidateQueries({ queryKey: ['schedule_tasks'] });
      queryClient.invalidateQueries({ queryKey: ['meeting_action_items'] });
    },
  });
}

// Complete action item
export function useCompleteActionItem() {
  const updateMutation = useUpdateActionItem();

  return useMutation({
    mutationFn: async ({ id, source }: { id: string; source: 'task' | 'meeting' }) => {
      return updateMutation.mutateAsync({ id, source, status: 'completed' });
    },
  });
}
