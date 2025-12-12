'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CashlessWallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'closed';
  wristband_id?: string;
  card_id?: string;
  created_at: string;
}

export interface CashlessTransaction {
  id: string;
  wallet_id: string;
  amount: number;
  type: 'topup' | 'purchase' | 'refund' | 'transfer';
  vendor_id?: string;
  description?: string;
  created_at: string;
}

export function useCashlessWallet(userId?: string) {
  return useQuery({
    queryKey: ['cashless-wallet', userId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append('user_id', userId);
      
      const response = await fetch(`/api/cashless-payments?${params}`);
      if (!response.ok) throw new Error('Failed to fetch cashless wallet');
      return response.json();
    },
    enabled: !!userId,
  });
}

export function useCashlessTransactions(walletId?: string, limit = 20) {
  return useQuery({
    queryKey: ['cashless-transactions', walletId, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (walletId) params.append('wallet_id', walletId);
      params.append('limit', String(limit));
      params.append('type', 'transactions');
      
      const response = await fetch(`/api/cashless-payments?${params}`);
      if (!response.ok) throw new Error('Failed to fetch cashless transactions');
      return response.json();
    },
    enabled: !!walletId,
  });
}

export function useTopUpWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      user_id: string;
      amount: number;
      payment_method_id: string;
    }) => {
      const response = await fetch('/api/cashless-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, action: 'topup' }),
      });
      if (!response.ok) throw new Error('Failed to top up wallet');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cashless-wallet', variables.user_id] });
    },
  });
}

export function useCashlessPurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      user_id: string;
      amount: number;
      vendor_id: string;
      items?: { name: string; quantity: number; price: number }[];
    }) => {
      const response = await fetch('/api/cashless-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, action: 'purchase' }),
      });
      if (!response.ok) throw new Error('Failed to process purchase');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cashless-wallet', variables.user_id] });
    },
  });
}

export function useLinkWristband() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      user_id: string;
      wristband_id: string;
    }) => {
      const response = await fetch('/api/cashless-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, action: 'link_wristband' }),
      });
      if (!response.ok) throw new Error('Failed to link wristband');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cashless-wallet', variables.user_id] });
    },
  });
}
