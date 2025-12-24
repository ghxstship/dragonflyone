import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface UnionRule {
  id: string;
  union: string;
  category: string;
  rule: string;
  description: string;
  effectiveDate: string;
  status: 'Active' | 'Pending' | 'Expired';
  penaltyType?: string;
  penaltyAmount?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/union-rules';

async function fetchRules(params?: { union?: string; category?: string; status?: string }): Promise<UnionRule[]> {
  const searchParams = new URLSearchParams();
  if (params?.union) searchParams.set('union', params.union);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.status) searchParams.set('status', params.status);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch union rules');
  }

  const { data } = await response.json();
  return data || [];
}

async function deleteRules(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete union rules');
  }
}

export function useUnionRulesQuery(params?: { union?: string; category?: string; status?: string }) {
  return useQuery({
    queryKey: ['union-rules', params],
    queryFn: () => fetchRules(params),
    staleTime: 60000,
  });
}

export function useDeleteUnionRules() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRules,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['union-rules'] }),
  });
}

export function useUnionRules(params?: { union?: string; category?: string; status?: string }) {
  const query = useUnionRulesQuery(params);
  const deleteMutation = useDeleteUnionRules();

  const rules = query.data || [];

  return {
    rules,
    summary: {
      total: rules.length,
      active: rules.filter(r => r.status === 'Active').length,
      unions: new Set(rules.map(r => r.union)).size,
      totalPenalties: rules.filter(r => r.penaltyAmount).reduce((sum, r) => sum + (r.penaltyAmount || 0), 0),
    },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    deleteRules: deleteMutation.mutate,
    deleteRulesAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
