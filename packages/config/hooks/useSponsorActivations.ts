import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface SponsorActivation {
  id: string;
  name: string;
  event: string;
  location: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  type: string;
  staff_assigned: number;
  staff_required: number;
  impressions: number;
  engagements: number;
  sponsor_id?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

const API_BASE = '/api/sponsors/activations';

async function fetchSponsorActivations(params?: {
  sponsor_id?: string;
  status?: string;
}): Promise<SponsorActivation[]> {
  const searchParams = new URLSearchParams();
  if (params?.sponsor_id) searchParams.set('sponsor_id', params.sponsor_id);
  if (params?.status) searchParams.set('status', params.status);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch sponsor activations');
  }

  const { data } = await response.json();
  return data || [];
}

async function updateActivation(id: string, data: Partial<SponsorActivation>): Promise<SponsorActivation> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update activation');
  }

  const result = await response.json();
  return result.data;
}

export function useSponsorActivationsQuery(params?: { sponsor_id?: string; status?: string }) {
  return useQuery({
    queryKey: ['sponsor-activations', params],
    queryFn: () => fetchSponsorActivations(params),
    staleTime: 60000,
  });
}

export function useUpdateActivation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SponsorActivation> }) => updateActivation(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sponsor-activations'] }),
  });
}

export function useSponsorActivations(params?: { sponsor_id?: string; status?: string }) {
  const query = useSponsorActivationsQuery(params);
  const updateMutation = useUpdateActivation();

  const activations = query.data || [];

  return {
    activations,
    summary: {
      total: activations.length,
      upcoming: activations.filter(a => a.status === 'upcoming').length,
      active: activations.filter(a => a.status === 'active').length,
      completed: activations.filter(a => a.status === 'completed').length,
    },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateActivation: updateMutation.mutate,
    updateActivationAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
