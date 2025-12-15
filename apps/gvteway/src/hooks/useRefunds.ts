'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface RefundRequest {
  id: string;
  order_id: string;
  user_id: string;
  reason: string;
  refund_type: 'full' | 'partial' | 'exchange';
  original_amount: number;
  refund_amount: number;
  status: 'pending' | 'approved' | 'denied' | 'processing' | 'completed';
  submitted_at: string;
  resolved_at?: string;
  resolution_notes?: string;
  order?: {
    id: string;
    total: number;
    event?: {
      id: string;
      name: string;
      date: string;
    };
  };
}

export const refundKeys = {
  all: ['refunds'] as const,
  list: () => [...refundKeys.all, 'list'] as const,
  detail: (id: string) => [...refundKeys.all, 'detail', id] as const,
};

export function useRefunds() {
  return useQuery<RefundRequest[]>({
    queryKey: refundKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/refunds', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') || ''}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) return [];
        throw new Error('Failed to fetch refunds');
      }
      const data = await response.json();
      return data.refunds || [];
    },
  });
}

export function useCreateRefundRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: {
      order_id: string;
      reason: string;
      refund_type: 'full' | 'partial' | 'exchange';
    }) => {
      const response = await fetch('/api/refunds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') || ''}`,
        },
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit refund request');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: refundKeys.all });
    },
  });
}
