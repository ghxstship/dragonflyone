'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// TASKS & CONTINGENCIES HOOKS
// Manage schedule tasks and contingency plans for productions
// Event-level roles: Production Manager, Operations Director, Department Heads
// =============================================================================

export interface ScheduleTask {
  id: string;
  production_id: string;
  show_id?: string;
  title: string;
  description?: string;
  task_type: 'setup' | 'rehearsal' | 'performance' | 'teardown' | 'meeting' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'blocked';
  assigned_to?: string;
  department?: string;
  start_time?: string;
  end_time?: string;
  due_date?: string;
  completed_at?: string;
  dependencies?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  assignee?: { id: string; first_name: string; last_name: string };
  show?: { id: string; title: string };
}

export interface Contingency {
  id: string;
  production_id: string;
  title: string;
  description?: string;
  trigger_condition: string;
  response_plan: string;
  category: 'weather' | 'technical' | 'safety' | 'medical' | 'security' | 'staffing' | 'vendor' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'triggered' | 'resolved' | 'archived';
  owner_id?: string;
  backup_owner_id?: string;
  notification_list?: string[];
  resources_required?: string[];
  estimated_impact?: string;
  triggered_at?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  owner?: { id: string; first_name: string; last_name: string };
  backup_owner?: { id: string; first_name: string; last_name: string };
}

interface TaskFilters {
  productionId?: string;
  showId?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  department?: string;
}

interface ContingencyFilters {
  productionId?: string;
  category?: string;
  severity?: string;
  status?: string;
}

// Fetch tasks
export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: ['schedule_tasks', filters],
    queryFn: async () => {
      let query = supabase
        .from('schedule_tasks')
        .select(`
          *,
          assignee:contacts!assigned_to(id, first_name, last_name),
          show:shows(id, title)
        `)
        .order('due_date', { ascending: true });

      if (filters?.productionId) {
        query = query.eq('production_id', filters.productionId);
      }
      if (filters?.showId) {
        query = query.eq('show_id', filters.showId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }
      if (filters?.department) {
        query = query.eq('department', filters.department);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as ScheduleTask[];
    },
  });
}

// Fetch single task
export function useTask(id: string) {
  return useQuery({
    queryKey: ['schedule_tasks', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedule_tasks')
        .select(`
          *,
          assignee:contacts!assigned_to(id, first_name, last_name),
          show:shows(id, title)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as ScheduleTask;
    },
    enabled: !!id,
  });
}

// Fetch contingencies
export function useContingencies(filters?: ContingencyFilters) {
  return useQuery({
    queryKey: ['contingencies', filters],
    queryFn: async () => {
      let query = supabase
        .from('contingencies')
        .select(`
          *,
          owner:contacts!owner_id(id, first_name, last_name),
          backup_owner:contacts!backup_owner_id(id, first_name, last_name)
        `)
        .order('severity', { ascending: false });

      if (filters?.productionId) {
        query = query.eq('production_id', filters.productionId);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Contingency[];
    },
  });
}

// Fetch single contingency
export function useContingency(id: string) {
  return useQuery({
    queryKey: ['contingencies', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contingencies')
        .select(`
          *,
          owner:contacts!owner_id(id, first_name, last_name),
          backup_owner:contacts!backup_owner_id(id, first_name, last_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as Contingency;
    },
    enabled: !!id,
  });
}

// Create task
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Omit<ScheduleTask, 'id' | 'created_at' | 'updated_at' | 'assignee' | 'show'>) => {
      const { data, error } = await supabase
        .from('schedule_tasks')
        .insert(task)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule_tasks'] });
    },
  });
}

// Update task
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ScheduleTask> & { id: string }) => {
      const { data, error } = await supabase
        .from('schedule_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['schedule_tasks'] });
      queryClient.invalidateQueries({ queryKey: ['schedule_tasks', variables.id] });
    },
  });
}

// Complete task
export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('schedule_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['schedule_tasks'] });
      queryClient.invalidateQueries({ queryKey: ['schedule_tasks', id] });
    },
  });
}

// Create contingency
export function useCreateContingency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contingency: Omit<Contingency, 'id' | 'created_at' | 'updated_at' | 'owner' | 'backup_owner'>) => {
      const { data, error } = await supabase
        .from('contingencies')
        .insert(contingency)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contingencies'] });
    },
  });
}

// Update contingency
export function useUpdateContingency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Contingency> & { id: string }) => {
      const { data, error } = await supabase
        .from('contingencies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contingencies'] });
      queryClient.invalidateQueries({ queryKey: ['contingencies', variables.id] });
    },
  });
}

// Trigger contingency
export function useTriggerContingency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('contingencies')
        .update({
          status: 'triggered',
          triggered_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['contingencies'] });
      queryClient.invalidateQueries({ queryKey: ['contingencies', id] });
    },
  });
}

// Resolve contingency
export function useResolveContingency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('contingencies')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['contingencies'] });
      queryClient.invalidateQueries({ queryKey: ['contingencies', id] });
    },
  });
}

// Get task statistics
export function useTaskStats(productionId?: string) {
  return useQuery({
    queryKey: ['schedule_tasks', 'stats', productionId],
    queryFn: async () => {
      let query = supabase.from('schedule_tasks').select('status, priority');
      
      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const tasks = data || [];
      return {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        blocked: tasks.filter(t => t.status === 'blocked').length,
        critical: tasks.filter(t => t.priority === 'critical').length,
        high: tasks.filter(t => t.priority === 'high').length,
      };
    },
  });
}

// Get contingency statistics
export function useContingencyStats(productionId?: string) {
  return useQuery({
    queryKey: ['contingencies', 'stats', productionId],
    queryFn: async () => {
      let query = supabase.from('contingencies').select('status, severity, category');
      
      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const contingencies = data || [];
      return {
        total: contingencies.length,
        active: contingencies.filter(c => c.status === 'active').length,
        triggered: contingencies.filter(c => c.status === 'triggered').length,
        resolved: contingencies.filter(c => c.status === 'resolved').length,
        critical: contingencies.filter(c => c.severity === 'critical').length,
        high: contingencies.filter(c => c.severity === 'high').length,
      };
    },
  });
}

// =============================================================================
// TASK TEMPLATES
// Reusable templates for common production tasks
// =============================================================================

export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  task_type: 'setup' | 'rehearsal' | 'performance' | 'teardown' | 'meeting' | 'other';
  default_priority: 'low' | 'medium' | 'high' | 'critical';
  default_duration_hours?: number;
  department?: string;
  checklist?: string[];
  dependencies_template?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Fetch task templates
export function useTaskTemplates() {
  return useQuery({
    queryKey: ['task_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as unknown as TaskTemplate[];
    },
  });
}

// Create task template
export function useCreateTaskTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: Omit<TaskTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('task_templates')
        .insert(template)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task_templates'] });
    },
  });
}

// Update task template
export function useUpdateTaskTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TaskTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('task_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task_templates'] });
      queryClient.invalidateQueries({ queryKey: ['task_templates', variables.id] });
    },
  });
}

// Delete task template
export function useDeleteTaskTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('task_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task_templates'] });
    },
  });
}
