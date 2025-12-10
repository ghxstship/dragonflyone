'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Stakeholder {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  permission_level: 'view' | 'comment' | 'edit' | 'admin';
  projects: string[];
  last_activity: string;
  status: 'active' | 'invited' | 'inactive';
  [key: string]: unknown;
}

const DEMO_STAKEHOLDERS: Stakeholder[] = [
  { id: '1', name: 'John Smith', email: 'john@acme.com', role: 'Client', organization: 'Acme Corp', permission_level: 'view', projects: ['proj-1'], last_activity: '2025-01-15', status: 'active' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@partner.com', role: 'Partner', organization: 'Partner Inc', permission_level: 'edit', projects: ['proj-1', 'proj-2'], last_activity: '2025-01-20', status: 'active' },
];

export const stakeholderKeys = {
  all: ['stakeholders'] as const,
  list: () => [...stakeholderKeys.all, 'list'] as const,
};

export function useStakeholdersList() {
  return useQuery({
    queryKey: stakeholderKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/stakeholders');
      if (response.status === 401) {
        return DEMO_STAKEHOLDERS;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch stakeholders');
      }
      const data = await response.json();
      return data.stakeholders || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateStakeholder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await fetch('/api/stakeholders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create stakeholder');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stakeholderKeys.all });
    },
  });
}

export function useDeleteStakeholder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/stakeholders/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete stakeholder');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stakeholderKeys.all });
    },
  });
}

export function useStakeholdersData() {
  const stakeholdersQuery = useStakeholdersList();
  const createMutation = useCreateStakeholder();
  const deleteMutation = useDeleteStakeholder();

  const stakeholders = stakeholdersQuery.data || [];
  const activeCount = stakeholders.filter((s: Stakeholder) => s.status === 'active').length;
  const adminCount = stakeholders.filter((s: Stakeholder) => s.permission_level === 'admin').length;

  return {
    stakeholders,
    activeCount,
    adminCount,
    isLoading: stakeholdersQuery.isLoading,
    error: stakeholdersQuery.error,
    createStakeholder: createMutation.mutateAsync,
    deleteStakeholder: deleteMutation.mutateAsync,
    refetch: stakeholdersQuery.refetch,
  };
}
