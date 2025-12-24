import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface LaborLaw {
  id: string;
  state: string;
  stateCode: string;
  category: string;
  requirement: string;
  description: string;
  effectiveDate: string;
  lastUpdated: string;
  status: 'Active' | 'Updated' | 'Pending';
  source?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/labor-laws';

async function fetchLaws(params?: { state?: string; category?: string; status?: string }): Promise<LaborLaw[]> {
  const searchParams = new URLSearchParams();
  if (params?.state) searchParams.set('state', params.state);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.status) searchParams.set('status', params.status);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch labor laws');
  }

  const { data } = await response.json();
  return data || [];
}

async function deleteLaws(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete labor laws');
  }
}

export function useLaborLawsQuery(params?: { state?: string; category?: string; status?: string }) {
  return useQuery({
    queryKey: ['labor-laws', params],
    queryFn: () => fetchLaws(params),
    staleTime: 60000,
  });
}

export function useDeleteLaborLaws() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLaws,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['labor-laws'] }),
  });
}

export function useLaborLaws(params?: { state?: string; category?: string; status?: string }) {
  const query = useLaborLawsQuery(params);
  const deleteMutation = useDeleteLaborLaws();

  const laws = query.data || [];

  return {
    laws,
    summary: {
      total: laws.length,
      totalStates: new Set(laws.map(l => l.state)).size,
      updated: laws.filter(l => l.status === 'Updated').length,
      active: laws.filter(l => l.status === 'Active').length,
    },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    deleteLaws: deleteMutation.mutate,
    deleteLawsAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
