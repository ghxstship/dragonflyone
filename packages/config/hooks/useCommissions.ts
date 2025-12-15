import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CommissionRecord {
  id: string;
  salesRep: string;
  dealId: string;
  dealName: string;
  client: string;
  dealValue: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'Pending' | 'Approved' | 'Paid' | 'Disputed';
  closeDate: string;
  paymentDate?: string;
}

export interface CreateCommissionParams {
  salesRep: string;
  dealName: string;
  client: string;
  dealValue: number;
  commissionRate: number;
}

const API_BASE = '/api/finance/commissions';

async function fetchCommissions(params?: {
  status?: string;
  salesRep?: string;
}): Promise<CommissionRecord[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.salesRep) searchParams.set('sales_rep', params.salesRep);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch commissions');
  }

  const { data } = await response.json();

  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    salesRep: item.sales_rep as string || item.salesRep as string || '',
    dealId: item.deal_id as string || item.dealId as string || '',
    dealName: item.deal_name as string || item.dealName as string || '',
    client: item.client as string || '',
    dealValue: item.deal_value as number || item.dealValue as number || 0,
    commissionRate: item.commission_rate as number || item.commissionRate as number || 0,
    commissionAmount: item.commission_amount as number || item.commissionAmount as number || 0,
    status: item.status as CommissionRecord['status'] || 'Pending',
    closeDate: item.close_date as string || item.closeDate as string || '',
    paymentDate: item.payment_date as string | undefined,
  }));
}

async function createCommission(params: CreateCommissionParams): Promise<CommissionRecord> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sales_rep: params.salesRep,
      deal_name: params.dealName,
      client: params.client,
      deal_value: params.dealValue,
      commission_rate: params.commissionRate,
      commission_amount: Math.round(params.dealValue * params.commissionRate / 100),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create commission');
  }

  const { data } = await response.json();
  return data;
}

async function updateCommissionStatus(id: string, status: string, paymentDate?: string): Promise<CommissionRecord> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, payment_date: paymentDate }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update commission');
  }

  const { data } = await response.json();
  return data;
}

async function deleteCommissions(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete commissions');
  }
}

async function bulkUpdateCommissionStatus(ids: string[], status: string): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to bulk update commissions');
  }
}

export function useCommissionsQuery(params?: { status?: string; salesRep?: string }) {
  return useQuery({
    queryKey: ['commissions', params],
    queryFn: () => fetchCommissions(params),
    staleTime: 60000,
  });
}

export function useCreateCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCommission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
    },
  });
}

export function useUpdateCommissionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, paymentDate }: { id: string; status: string; paymentDate?: string }) =>
      updateCommissionStatus(id, status, paymentDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
    },
  });
}

export function useDeleteCommissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCommissions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
    },
  });
}

export function useBulkUpdateCommissionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: string }) =>
      bulkUpdateCommissionStatus(ids, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
    },
  });
}

export function useCommissions() {
  const commissionsQuery = useCommissionsQuery();
  const createMutation = useCreateCommission();
  const updateStatusMutation = useUpdateCommissionStatus();
  const deleteMutation = useDeleteCommissions();
  const bulkUpdateMutation = useBulkUpdateCommissionStatus();

  return {
    commissions: commissionsQuery.data || [],
    isLoading: commissionsQuery.isLoading,
    error: commissionsQuery.error,
    refetch: commissionsQuery.refetch,
    createCommission: createMutation.mutate,
    createCommissionAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateStatus: updateStatusMutation.mutate,
    updateStatusAsync: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
    deleteCommissions: deleteMutation.mutate,
    deleteCommissionsAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    bulkUpdateStatus: bulkUpdateMutation.mutate,
    bulkUpdateStatusAsync: bulkUpdateMutation.mutateAsync,
    isBulkUpdating: bulkUpdateMutation.isPending,
  };
}
