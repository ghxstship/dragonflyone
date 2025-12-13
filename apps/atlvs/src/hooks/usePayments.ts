'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Payment {
  id: string;
  invoice_id?: string;
  client_id?: string;
  vendor_id?: string;
  amount: number;
  currency: string;
  payment_method: 'card' | 'bank' | 'wallet' | 'crypto' | 'cash' | 'check' | 'wire';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  payment_date: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  invoice?: {
    id: string;
    invoice_number: string;
    total_amount: number;
  };
}

interface PaymentFilters {
  status?: string;
  payment_method?: string;
  invoice_id?: string;
  client_id?: string;
  start_date?: string;
  end_date?: string;
}

interface PaymentsResponse {
  payments: Payment[];
  summary: {
    total: number;
    total_amount: number;
    by_status: Record<string, number>;
    by_method: Record<string, number>;
  };
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export function usePayments(filters?: PaymentFilters) {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.payment_method) params.append('payment_method', filters.payment_method);
      if (filters?.invoice_id) params.append('invoice_id', filters.invoice_id);
      if (filters?.client_id) params.append('client_id', filters.client_id);
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);

      const response = await fetch(`/api/payments?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      return response.json() as Promise<PaymentsResponse>;
    },
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: ['payments', id],
    queryFn: async () => {
      const response = await fetch(`/api/payments/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment');
      }
      const data = await response.json();
      return data.payment as Payment;
    },
    enabled: !!id,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });
      if (!response.ok) {
        throw new Error('Failed to create payment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Payment> & { id: string }) => {
      const response = await fetch(`/api/payments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update payment');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payments', variables.id] });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/payments/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete payment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

export function usePaymentStats() {
  return useQuery({
    queryKey: ['payments', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/payments');
      if (!response.ok) {
        throw new Error('Failed to fetch payment stats');
      }
      const data = await response.json() as PaymentsResponse;
      return data.summary;
    },
  });
}
