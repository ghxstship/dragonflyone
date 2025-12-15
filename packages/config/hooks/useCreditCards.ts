import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CreditCardTxn {
  id: string;
  date: string;
  merchant: string;
  cardHolder: string;
  lastFour: string;
  category: string;
  amount: number;
  status: 'Posted' | 'Pending' | 'Disputed';
  receipt: boolean;
  department: string;
}

const API_BASE = '/api/finance/credit-cards';

async function fetchCreditCardTransactions(params?: {
  status?: string;
  category?: string;
}): Promise<CreditCardTxn[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.category) searchParams.set('category', params.category);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch credit card transactions');
  }

  const { data } = await response.json();

  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    date: item.date as string || item.transaction_date as string || '',
    merchant: item.merchant as string || '',
    cardHolder: item.card_holder as string || item.cardHolder as string || '',
    lastFour: item.last_four as string || item.lastFour as string || '',
    category: item.category as string || '',
    amount: item.amount as number || 0,
    status: item.status as CreditCardTxn['status'] || 'Pending',
    receipt: item.receipt as boolean || false,
    department: item.department as string || '',
  }));
}

async function updateTransactionStatus(id: string, status: string): Promise<CreditCardTxn> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update transaction');
  }

  const { data } = await response.json();
  return data;
}

async function deleteTransactions(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete transactions');
  }
}

async function bulkApproveTransactions(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk-approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to approve transactions');
  }
}

export function useCreditCardTransactionsQuery(params?: { status?: string; category?: string }) {
  return useQuery({
    queryKey: ['credit-card-transactions', params],
    queryFn: () => fetchCreditCardTransactions(params),
    staleTime: 60000,
  });
}

export function useUpdateTransactionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateTransactionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-card-transactions'] });
    },
  });
}

export function useDeleteTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-card-transactions'] });
    },
  });
}

export function useBulkApproveTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkApproveTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-card-transactions'] });
    },
  });
}

export function useCreditCards() {
  const transactionsQuery = useCreditCardTransactionsQuery();
  const updateStatusMutation = useUpdateTransactionStatus();
  const deleteMutation = useDeleteTransactions();
  const bulkApproveMutation = useBulkApproveTransactions();

  return {
    transactions: transactionsQuery.data || [],
    isLoading: transactionsQuery.isLoading,
    error: transactionsQuery.error,
    refetch: transactionsQuery.refetch,
    updateStatus: updateStatusMutation.mutate,
    updateStatusAsync: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
    deleteTransactions: deleteMutation.mutate,
    deleteTransactionsAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    bulkApprove: bulkApproveMutation.mutate,
    bulkApproveAsync: bulkApproveMutation.mutateAsync,
    isBulkApproving: bulkApproveMutation.isPending,
  };
}
