import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface SponsorDeliverable {
  id: string;
  sponsor_id: string;
  sponsorship_id: string;
  title: string;
  description?: string;
  deliverable_type: 'logo_placement' | 'signage' | 'digital' | 'activation' | 'hospitality' | 'merchandise' | 'content' | 'other';
  status: 'pending' | 'in_progress' | 'delivered' | 'approved' | 'rejected';
  due_date?: string;
  completed_date?: string;
  value?: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
  sponsor?: { id: string; company_name: string };
}

const API_BASE = '/api/sponsors/deliverables';

async function fetchDeliverables(params?: {
  sponsor_id?: string;
  status?: string;
}): Promise<SponsorDeliverable[]> {
  const searchParams = new URLSearchParams();
  if (params?.sponsor_id) searchParams.set('sponsor_id', params.sponsor_id);
  if (params?.status) searchParams.set('status', params.status);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch deliverables');
  }

  const { data } = await response.json();
  return data || [];
}

async function createDeliverable(data: Partial<SponsorDeliverable>): Promise<SponsorDeliverable> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create deliverable');
  }

  const result = await response.json();
  return result.data;
}

async function updateDeliverable(id: string, data: Partial<SponsorDeliverable>): Promise<SponsorDeliverable> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update deliverable');
  }

  const result = await response.json();
  return result.data;
}

async function deleteDeliverables(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete deliverables');
  }
}

export function useDeliverablesQuery(params?: { sponsor_id?: string; status?: string }) {
  return useQuery({
    queryKey: ['sponsor-deliverables', params],
    queryFn: () => fetchDeliverables(params),
    staleTime: 60000,
  });
}

export function useCreateDeliverable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDeliverable,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sponsor-deliverables'] }),
  });
}

export function useUpdateDeliverable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SponsorDeliverable> }) => updateDeliverable(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sponsor-deliverables'] }),
  });
}

export function useDeleteDeliverables() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDeliverables,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sponsor-deliverables'] }),
  });
}

export function useSponsorDeliverables(params?: { sponsor_id?: string; status?: string }) {
  const query = useDeliverablesQuery(params);
  const createMutation = useCreateDeliverable();
  const updateMutation = useUpdateDeliverable();
  const deleteMutation = useDeleteDeliverables();

  return {
    deliverables: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createDeliverable: createMutation.mutate,
    updateDeliverable: updateMutation.mutate,
    deleteDeliverables: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
