import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Referral {
  id: string;
  candidateName: string;
  candidateEmail?: string;
  candidatePhone?: string;
  position: string;
  referredBy: string;
  referrerDept: string;
  submittedDate: string;
  status: 'Pending' | 'Interviewing' | 'Hired' | 'Rejected';
  bonusAmount?: number;
  bonusStatus?: 'Pending' | 'Paid';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/referrals';

async function fetchReferrals(params?: { status?: string }): Promise<Referral[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch referrals');
  }

  const { data } = await response.json();
  return data || [];
}

async function createReferral(data: Partial<Referral>): Promise<Referral> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create referral');
  }

  const result = await response.json();
  return result.data;
}

async function updateReferral(id: string, data: Partial<Referral>): Promise<Referral> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update referral');
  }

  const result = await response.json();
  return result.data;
}

async function deleteReferrals(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete referrals');
  }
}

async function hireReferrals(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk-hire`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to mark referrals as hired');
  }
}

export function useReferralsQuery(params?: { status?: string }) {
  return useQuery({
    queryKey: ['referrals', params],
    queryFn: () => fetchReferrals(params),
    staleTime: 60000,
  });
}

export function useCreateReferral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReferral,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['referrals'] }),
  });
}

export function useUpdateReferral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Referral> }) => updateReferral(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['referrals'] }),
  });
}

export function useDeleteReferrals() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReferrals,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['referrals'] }),
  });
}

export function useHireReferrals() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hireReferrals,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['referrals'] }),
  });
}

export function useReferrals(params?: { status?: string }) {
  const query = useReferralsQuery(params);
  const createMutation = useCreateReferral();
  const updateMutation = useUpdateReferral();
  const deleteMutation = useDeleteReferrals();
  const hireMutation = useHireReferrals();

  const referrals = query.data || [];

  return {
    referrals,
    summary: {
      total: referrals.length,
      hired: referrals.filter(r => r.status === 'Hired').length,
      pendingBonuses: referrals.filter(r => r.bonusStatus === 'Pending').reduce((s, r) => s + (r.bonusAmount || 0), 0),
      totalPaid: referrals.filter(r => r.bonusStatus === 'Paid').reduce((s, r) => s + (r.bonusAmount || 0), 0),
    },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createReferral: createMutation.mutate,
    createReferralAsync: createMutation.mutateAsync,
    updateReferral: updateMutation.mutate,
    updateReferralAsync: updateMutation.mutateAsync,
    deleteReferrals: deleteMutation.mutate,
    deleteReferralsAsync: deleteMutation.mutateAsync,
    hireReferrals: hireMutation.mutate,
    hireReferralsAsync: hireMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isHiring: hireMutation.isPending,
  };
}
