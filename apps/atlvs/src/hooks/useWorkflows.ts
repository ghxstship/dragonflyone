'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface WorkflowAction {
  type: string;
  config: Record<string, unknown>;
  order: number;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  trigger_type: 'manual' | 'schedule' | 'event' | 'webhook';
  trigger_config?: Record<string, unknown>;
  actions?: WorkflowAction[];
  enabled: boolean;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  created_by_user?: {
    id: string;
    full_name?: string;
    email: string;
  };
  executions?: { count: number }[];
}

interface WorkflowFilters {
  status?: 'enabled' | 'disabled';
  trigger_type?: string;
}

export function useWorkflows(filters?: WorkflowFilters) {
  return useQuery({
    queryKey: ['workflows', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.trigger_type) params.append('trigger_type', filters.trigger_type);

      const response = await fetch(`/api/workflows?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workflows');
      }
      const data = await response.json();
      return data.workflows as Workflow[];
    },
  });
}

export function useWorkflow(id: string) {
  return useQuery({
    queryKey: ['workflows', id],
    queryFn: async () => {
      const response = await fetch(`/api/workflows/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workflow');
      }
      const data = await response.json();
      return data.workflow as Workflow;
    },
    enabled: !!id,
  });
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workflow: Omit<Workflow, 'id' | 'created_at' | 'updated_at' | 'created_by_user' | 'executions'>) => {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow),
      });
      if (!response.ok) {
        throw new Error('Failed to create workflow');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
}

export function useUpdateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Workflow> & { id: string }) => {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update workflow');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflows', variables.id] });
    },
  });
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete workflow');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
}

export function useToggleWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      if (!response.ok) {
        throw new Error('Failed to toggle workflow');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflows', variables.id] });
    },
  });
}
