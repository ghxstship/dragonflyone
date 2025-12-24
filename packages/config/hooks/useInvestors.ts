import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Investor {
  id: string;
  production_id: string;
  round_id?: string;
  investor_type: 'individual' | 'entity' | 'fund';
  name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  investment_amount: number;
  ownership_percentage?: number;
  status: 'prospect' | 'committed' | 'funded' | 'exited';
  commitment_date?: string;
  funding_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  investment_rounds?: {
    id: string;
    name: string;
    target_amount: number;
    raised_amount: number;
  };
}

export interface InvestorSummary {
  total: number;
  total_invested: number;
  by_status: {
    prospect: number;
    committed: number;
    funded: number;
    exited: number;
  };
  by_type: {
    individual: number;
    entity: number;
    fund: number;
  };
}

export interface InvestorsResponse {
  investors: Investor[];
  summary: InvestorSummary;
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

const API_BASE = '/api/investors';

async function fetchInvestors(params?: {
  production_id?: string;
  round_id?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<InvestorsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.production_id) searchParams.set('production_id', params.production_id);
  if (params?.round_id) searchParams.set('round_id', params.round_id);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch investors');
  }

  return response.json();
}

async function fetchInvestor(id: string): Promise<Investor> {
  const response = await fetch(`${API_BASE}/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch investor');
  }

  const { investor } = await response.json();
  return investor;
}

async function createInvestor(data: Omit<Investor, 'id' | 'created_at' | 'updated_at'>): Promise<Investor> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create investor');
  }

  const { investor } = await response.json();
  return investor;
}

async function updateInvestor(id: string, data: Partial<Investor>): Promise<Investor> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update investor');
  }

  const { investor } = await response.json();
  return investor;
}

async function deleteInvestor(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete investor');
  }
}

export function useInvestorsQuery(params?: {
  production_id?: string;
  round_id?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['investors', params],
    queryFn: () => fetchInvestors(params),
    staleTime: 60000,
  });
}

export function useInvestorQuery(id: string) {
  return useQuery({
    queryKey: ['investors', id],
    queryFn: () => fetchInvestor(id),
    enabled: !!id,
  });
}

export function useCreateInvestor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvestor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investors'] });
    },
  });
}

export function useUpdateInvestor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Investor> & { id: string }) =>
      updateInvestor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investors'] });
    },
  });
}

export function useDeleteInvestor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInvestor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investors'] });
    },
  });
}

export function useInvestors(params?: {
  production_id?: string;
  round_id?: string;
  status?: string;
}) {
  const investorsQuery = useInvestorsQuery(params);
  const createMutation = useCreateInvestor();
  const updateMutation = useUpdateInvestor();
  const deleteMutation = useDeleteInvestor();

  return {
    investors: investorsQuery.data?.investors || [],
    summary: investorsQuery.data?.summary || null,
    pagination: investorsQuery.data?.pagination || null,
    isLoading: investorsQuery.isLoading,
    error: investorsQuery.error,
    refetch: investorsQuery.refetch,
    createInvestor: createMutation.mutate,
    createInvestorAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateInvestor: updateMutation.mutate,
    updateInvestorAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteInvestor: deleteMutation.mutate,
    deleteInvestorAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
