import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Refund {
  id: string;
  payment_id: string;
  amount: number;
  currency: string;
  reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'other';
  reason_details?: string;
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  refund_date: string;
  processed_by?: string;
  created_at: string;
  payment?: {
    id: string;
    amount: number;
    invoice_id?: string;
  };
}

export interface CreateRefundInput {
  payment_id: string;
  amount: number;
  reason: Refund['reason'];
  reason_details?: string;
}

async function fetchRefunds(filters?: { payment_id?: string; status?: string }): Promise<{ refunds: Refund[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.payment_id) {
    params.set('payment_id', filters.payment_id);
  }
  if (filters?.status) {
    params.set('status', filters.status);
  }

  const response = await fetch(`/api/payments/refunds?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch refunds');
  }
  return response.json();
}

async function fetchRefund(id: string): Promise<Refund> {
  const response = await fetch(`/api/payments/refunds/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch refund');
  }
  return response.json();
}

async function createRefund(input: CreateRefundInput): Promise<Refund> {
  const response = await fetch('/api/payments/refunds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create refund');
  }
  return response.json();
}

async function cancelRefund(id: string): Promise<Refund> {
  const response = await fetch(`/api/payments/refunds/${id}/cancel`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to cancel refund');
  }
  return response.json();
}

export function useRefunds(filters?: { payment_id?: string; status?: string }) {
  return useQuery({
    queryKey: ['refunds', filters],
    queryFn: () => fetchRefunds(filters),
  });
}

export function useRefund(id: string) {
  return useQuery({
    queryKey: ['refund', id],
    queryFn: () => fetchRefund(id),
    enabled: !!id,
  });
}

export function useCreateRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRefund,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payments', data.payment_id] });
    },
  });
}

export function useCancelRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelRefund,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      queryClient.invalidateQueries({ queryKey: ['refund', data.id] });
    },
  });
}
