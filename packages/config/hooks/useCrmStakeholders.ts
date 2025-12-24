import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CrmStakeholder {
  id: string;
  name: string;
  company: string;
  role: string;
  email?: string;
  phone?: string;
  influence: 'High' | 'Medium' | 'Low';
  sentiment: 'Champion' | 'Supporter' | 'Neutral' | 'Skeptic' | 'Blocker';
  decisionMaker: boolean;
  linkedDeal?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/stakeholders';

async function fetchStakeholders(params?: { influence?: string; sentiment?: string }): Promise<CrmStakeholder[]> {
  const searchParams = new URLSearchParams();
  if (params?.influence) searchParams.set('influence', params.influence);
  if (params?.sentiment) searchParams.set('sentiment', params.sentiment);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch stakeholders');
  }

  const { data } = await response.json();
  return data || [];
}

async function createStakeholder(data: Partial<CrmStakeholder>): Promise<CrmStakeholder> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create stakeholder');
  }

  const result = await response.json();
  return result.data;
}

async function updateStakeholder(id: string, data: Partial<CrmStakeholder>): Promise<CrmStakeholder> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update stakeholder');
  }

  const result = await response.json();
  return result.data;
}

async function deleteStakeholders(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete stakeholders');
  }
}

export function useCrmStakeholdersQuery(params?: { influence?: string; sentiment?: string }) {
  return useQuery({
    queryKey: ['crm-stakeholders', params],
    queryFn: () => fetchStakeholders(params),
    staleTime: 60000,
  });
}

export function useCreateCrmStakeholder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStakeholder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm-stakeholders'] }),
  });
}

export function useUpdateCrmStakeholder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CrmStakeholder> }) => updateStakeholder(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm-stakeholders'] }),
  });
}

export function useDeleteCrmStakeholders() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStakeholders,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm-stakeholders'] }),
  });
}

export function useCrmStakeholders(params?: { influence?: string; sentiment?: string }) {
  const query = useCrmStakeholdersQuery(params);
  const createMutation = useCreateCrmStakeholder();
  const updateMutation = useUpdateCrmStakeholder();
  const deleteMutation = useDeleteCrmStakeholders();

  const stakeholders = query.data || [];

  return {
    stakeholders,
    summary: {
      total: stakeholders.length,
      decisionMakers: stakeholders.filter(s => s.decisionMaker).length,
      champions: stakeholders.filter(s => s.sentiment === 'Champion').length,
      highInfluence: stakeholders.filter(s => s.influence === 'High').length,
    },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createStakeholder: createMutation.mutate,
    createStakeholderAsync: createMutation.mutateAsync,
    updateStakeholder: updateMutation.mutate,
    updateStakeholderAsync: updateMutation.mutateAsync,
    deleteStakeholders: deleteMutation.mutate,
    deleteStakeholdersAsync: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
