import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface BackgroundCheck {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  checkType: string;
  provider: string;
  requestDate: string;
  completedDate?: string;
  expiryDate?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed' | 'Expired' | 'Renewal Due';
  result?: 'Clear' | 'Review Required' | 'Failed';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/background-checks';

async function fetchChecks(params?: { status?: string; checkType?: string }): Promise<BackgroundCheck[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.checkType) searchParams.set('checkType', params.checkType);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch background checks');
  }

  const { data } = await response.json();
  return data || [];
}

async function createCheck(data: Partial<BackgroundCheck>): Promise<BackgroundCheck> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create background check');
  }

  const result = await response.json();
  return result.data;
}

async function deleteChecks(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete background checks');
  }
}

async function renewChecks(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk-renew`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to renew background checks');
  }
}

export function useBackgroundChecksQuery(params?: { status?: string; checkType?: string }) {
  return useQuery({
    queryKey: ['background-checks', params],
    queryFn: () => fetchChecks(params),
    staleTime: 60000,
  });
}

export function useCreateBackgroundCheck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCheck,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['background-checks'] }),
  });
}

export function useDeleteBackgroundChecks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteChecks,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['background-checks'] }),
  });
}

export function useRenewBackgroundChecks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: renewChecks,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['background-checks'] }),
  });
}

export function useBackgroundChecks(params?: { status?: string; checkType?: string }) {
  const query = useBackgroundChecksQuery(params);
  const createMutation = useCreateBackgroundCheck();
  const deleteMutation = useDeleteBackgroundChecks();
  const renewMutation = useRenewBackgroundChecks();

  const checks = query.data || [];

  return {
    checks,
    summary: {
      total: checks.length,
      pending: checks.filter(c => c.status === 'Pending' || c.status === 'In Progress').length,
      completed: checks.filter(c => c.status === 'Completed').length,
      renewalDue: checks.filter(c => c.status === 'Renewal Due').length,
      expired: checks.filter(c => c.status === 'Expired').length,
    },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createCheck: createMutation.mutate,
    createCheckAsync: createMutation.mutateAsync,
    deleteChecks: deleteMutation.mutate,
    deleteChecksAsync: deleteMutation.mutateAsync,
    renewChecks: renewMutation.mutate,
    renewChecksAsync: renewMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isRenewing: renewMutation.isPending,
  };
}
