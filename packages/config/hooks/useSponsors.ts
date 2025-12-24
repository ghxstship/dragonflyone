import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Sponsor {
  id: string;
  production_id: string;
  organization_id: string;
  sponsor_tier_id?: string;
  company_name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  logo_url?: string;
  website_url?: string;
  status: 'prospect' | 'negotiating' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  contract_value: number;
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue';
  amount_paid: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  sponsor_tiers?: {
    id: string;
    name: string;
    benefits: string[];
  };
}

export interface SponsorSummary {
  total: number;
  total_value: number;
  total_paid: number;
  by_status: {
    prospect: number;
    negotiating: number;
    confirmed: number;
    active: number;
    completed: number;
  };
}

export interface SponsorsResponse {
  sponsors: Sponsor[];
  summary: SponsorSummary;
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

const API_BASE = '/api/sponsors';

async function fetchSponsors(params?: {
  production_id?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<SponsorsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.production_id) searchParams.set('production_id', params.production_id);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch sponsors');
  }

  return response.json();
}

async function fetchSponsor(id: string): Promise<Sponsor> {
  const response = await fetch(`${API_BASE}/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch sponsor');
  }

  const { sponsor } = await response.json();
  return sponsor;
}

async function createSponsor(data: Omit<Sponsor, 'id' | 'created_at' | 'updated_at'>): Promise<Sponsor> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create sponsor');
  }

  const { sponsor } = await response.json();
  return sponsor;
}

async function updateSponsor(id: string, data: Partial<Sponsor>): Promise<Sponsor> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update sponsor');
  }

  const { sponsor } = await response.json();
  return sponsor;
}

async function deleteSponsor(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete sponsor');
  }
}

export function useSponsorsQuery(params?: {
  production_id?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['sponsors', params],
    queryFn: () => fetchSponsors(params),
    staleTime: 60000,
  });
}

export function useSponsorQuery(id: string) {
  return useQuery({
    queryKey: ['sponsors', id],
    queryFn: () => fetchSponsor(id),
    enabled: !!id,
  });
}

export function useCreateSponsor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSponsor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });
}

export function useUpdateSponsor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Sponsor> & { id: string }) =>
      updateSponsor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });
}

export function useDeleteSponsor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSponsor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });
}

export function useSponsors(params?: {
  production_id?: string;
  status?: string;
}) {
  const sponsorsQuery = useSponsorsQuery(params);
  const createMutation = useCreateSponsor();
  const updateMutation = useUpdateSponsor();
  const deleteMutation = useDeleteSponsor();

  return {
    sponsors: sponsorsQuery.data?.sponsors || [],
    summary: sponsorsQuery.data?.summary || null,
    pagination: sponsorsQuery.data?.pagination || null,
    isLoading: sponsorsQuery.isLoading,
    error: sponsorsQuery.error,
    refetch: sponsorsQuery.refetch,
    createSponsor: createMutation.mutate,
    createSponsorAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateSponsor: updateMutation.mutate,
    updateSponsorAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteSponsor: deleteMutation.mutate,
    deleteSponsorAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
