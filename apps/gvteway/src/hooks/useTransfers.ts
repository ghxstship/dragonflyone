'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Transfer {
  id: string;
  ticket_id: string;
  sender_id: string;
  recipient_id?: string;
  recipient_email: string;
  status: 'pending' | 'completed' | 'cancelled';
  direction: 'sent' | 'received';
  created_at: string;
  completed_at?: string;
  ticket?: {
    id: string;
    seat_number?: string;
    event?: {
      id: string;
      name: string;
      start_date: string;
      venue_name?: string;
    };
  };
}

export const transferKeys = {
  all: ['transfers'] as const,
  list: () => [...transferKeys.all, 'list'] as const,
  detail: (id: string) => [...transferKeys.all, 'detail', id] as const,
};

export function useTransfers() {
  return useQuery<Transfer[]>({
    queryKey: transferKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/transfers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') || ''}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) return [];
        throw new Error('Failed to fetch transfers');
      }
      const data = await response.json();
      return data.transfers || [];
    },
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: {
      ticket_id: string;
      recipient_email: string;
    }) => {
      const response = await fetch('/api/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') || ''}`,
        },
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create transfer');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transferKeys.all });
    },
  });
}
