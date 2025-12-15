import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'Credit' | 'Debit';
  status: 'Matched' | 'Unmatched' | 'Pending' | 'Reconciled';
  matchedTo?: string;
  bankAccount: string;
}

const API_BASE = '/api/finance/bank-transactions';

async function fetchBankTransactions(params?: {
  status?: string;
  bankAccount?: string;
}): Promise<BankTransaction[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.bankAccount) searchParams.set('bank_account', params.bankAccount);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch bank transactions');
  }

  const { data } = await response.json();

  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    date: item.date as string || item.transaction_date as string || '',
    description: item.description as string || '',
    amount: item.amount as number || 0,
    type: (item.type as BankTransaction['type']) || (item.amount as number > 0 ? 'Credit' : 'Debit'),
    status: item.status as BankTransaction['status'] || 'Unmatched',
    matchedTo: item.matched_to as string | undefined,
    bankAccount: item.bank_account as string || item.bankAccount as string || 'Operating',
  }));
}

async function deleteBankTransactions(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete bank transactions');
  }
}

async function reconcileBankTransactions(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk-reconcile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reconcile bank transactions');
  }
}

export function useBankTransactionsQuery(params?: {
  status?: string;
  bankAccount?: string;
}) {
  return useQuery({
    queryKey: ['bank-transactions', params],
    queryFn: () => fetchBankTransactions(params),
    staleTime: 60000,
  });
}

export function useDeleteBankTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBankTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-transactions'] });
    },
  });
}

export function useReconcileBankTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reconcileBankTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-transactions'] });
    },
  });
}

export function useBankReconciliation() {
  const transactionsQuery = useBankTransactionsQuery();
  const deleteMutation = useDeleteBankTransactions();
  const reconcileMutation = useReconcileBankTransactions();

  return {
    transactions: transactionsQuery.data || [],
    isLoading: transactionsQuery.isLoading,
    error: transactionsQuery.error,
    refetch: transactionsQuery.refetch,
    deleteTransactions: deleteMutation.mutate,
    deleteTransactionsAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    reconcileTransactions: reconcileMutation.mutate,
    reconcileTransactionsAsync: reconcileMutation.mutateAsync,
    isReconciling: reconcileMutation.isPending,
  };
}
