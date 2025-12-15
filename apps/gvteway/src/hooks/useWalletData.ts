'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'amex' | 'discover';
  last4: string;
  expiry: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'purchase' | 'refund' | 'credit';
  status: 'completed' | 'pending' | 'failed';
}

const DEMO_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm-1', type: 'visa', last4: '4242', expiry: '12/25', isDefault: true },
  { id: 'pm-2', type: 'mastercard', last4: '8888', expiry: '06/26', isDefault: false },
];

const DEMO_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', date: '2024-11-24', description: 'Summer Festival 2024 - VIP Pass', amount: 299.00, type: 'purchase', status: 'completed' },
  { id: 'tx-2', date: '2024-11-20', description: 'Concert Series - General Admission', amount: 75.00, type: 'purchase', status: 'completed' },
  { id: 'tx-3', date: '2024-11-15', description: 'Refund - Event Cancelled', amount: 50.00, type: 'refund', status: 'completed' },
];

export const walletKeys = {
  all: ['wallet'] as const,
  paymentMethods: () => [...walletKeys.all, 'payment-methods'] as const,
  transactions: () => [...walletKeys.all, 'transactions'] as const,
  balance: () => [...walletKeys.all, 'balance'] as const,
};

export function usePaymentMethods() {
  return useQuery({
    queryKey: walletKeys.paymentMethods(),
    queryFn: async () => {
      const response = await fetch('/api/wallet/payment-methods');
      if (response.status === 401) {
        return DEMO_PAYMENT_METHODS;
      }
      if (!response.ok) {
        return DEMO_PAYMENT_METHODS;
      }
      const data = await response.json();
      return data.paymentMethods?.length ? data.paymentMethods : DEMO_PAYMENT_METHODS;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTransactionHistory() {
  return useQuery({
    queryKey: walletKeys.transactions(),
    queryFn: async () => {
      const response = await fetch('/api/wallet/transactions');
      if (response.status === 401) {
        return DEMO_TRANSACTIONS;
      }
      if (!response.ok) {
        return DEMO_TRANSACTIONS;
      }
      const data = await response.json();
      return data.transactions?.length ? data.transactions : DEMO_TRANSACTIONS;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useAddPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentMethod: { cardNumber: string; expiry: string; cvv: string; name: string }) => {
      const response = await fetch('/api/wallet/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentMethod),
      });
      if (!response.ok) {
        throw new Error('Failed to add payment method');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.paymentMethods() });
    },
  });
}

export function useRemovePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const response = await fetch(`/api/wallet/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to remove payment method');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.paymentMethods() });
    },
  });
}

export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const response = await fetch(`/api/wallet/payment-methods/${paymentMethodId}/default`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Failed to set default payment method');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.paymentMethods() });
    },
  });
}

export function useWalletData() {
  const paymentMethodsQuery = usePaymentMethods();
  const transactionsQuery = useTransactionHistory();
  const addPaymentMutation = useAddPaymentMethod();
  const removePaymentMutation = useRemovePaymentMethod();
  const setDefaultMutation = useSetDefaultPaymentMethod();

  const paymentMethods = paymentMethodsQuery.data || DEMO_PAYMENT_METHODS;
  const transactions = transactionsQuery.data || DEMO_TRANSACTIONS;

  // Calculate wallet stats
  const totalSpent = transactions
    .filter((t: Transaction) => t.type === 'purchase' && t.status === 'completed')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  const totalRefunds = transactions
    .filter((t: Transaction) => t.type === 'refund' && t.status === 'completed')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  return {
    paymentMethods,
    transactions,
    totalSpent,
    totalRefunds,
    isLoading: paymentMethodsQuery.isLoading || transactionsQuery.isLoading,
    error: paymentMethodsQuery.error || transactionsQuery.error,
    refetchPaymentMethods: paymentMethodsQuery.refetch,
    refetchTransactions: transactionsQuery.refetch,
    addPaymentMethod: addPaymentMutation.mutateAsync,
    removePaymentMethod: removePaymentMutation.mutateAsync,
    setDefaultPaymentMethod: setDefaultMutation.mutateAsync,
    isUpdating: addPaymentMutation.isPending || removePaymentMutation.isPending || setDefaultMutation.isPending,
  };
}
