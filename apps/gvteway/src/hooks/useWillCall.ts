'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface WillCallTicket {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone?: string;
  eventName: string;
  ticketType: string;
  quantity: number;
  status: 'Pending' | 'Ready' | 'Picked Up' | 'No Show';
  notes?: string;
  idRequired: boolean;
  pickedUpAt?: string;
  pickedUpBy?: string;
}

const DEMO_TICKETS: WillCallTicket[] = [
  { id: 'WC-001', orderNumber: 'ORD-2024-1234', customerName: 'John Smith', email: 'john@email.com', phone: '+1 555-0101', eventName: 'Summer Fest 2024', ticketType: 'VIP', quantity: 2, status: 'Ready', idRequired: true },
  { id: 'WC-002', orderNumber: 'ORD-2024-1235', customerName: 'Sarah Johnson', email: 'sarah@email.com', eventName: 'Summer Fest 2024', ticketType: 'GA', quantity: 4, status: 'Ready', idRequired: true, notes: 'Guest may send alternate pickup' },
  { id: 'WC-003', orderNumber: 'ORD-2024-1236', customerName: 'Mike Davis', email: 'mike@email.com', phone: '+1 555-0103', eventName: 'Summer Fest 2024', ticketType: 'VIP', quantity: 1, status: 'Picked Up', idRequired: true, pickedUpAt: '2024-11-24 18:30', pickedUpBy: 'Mike Davis' },
];

export const willCallKeys = {
  all: ['will-call'] as const,
  list: () => [...willCallKeys.all, 'list'] as const,
};

export function useWillCallTickets() {
  return useQuery({
    queryKey: willCallKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/admin/will-call');
      if (!response.ok) return DEMO_TICKETS;
      const data = await response.json();
      return data.tickets || DEMO_TICKETS;
    },
    staleTime: 30 * 1000,
  });
}

export function useReleaseTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await fetch(`/api/admin/will-call/${ticketId}/release`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to release ticket');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: willCallKeys.all });
    },
  });
}

export function useWillCallData() {
  const ticketsQuery = useWillCallTickets();
  const releaseMutation = useReleaseTicket();

  return {
    tickets: ticketsQuery.data || [],
    isLoading: ticketsQuery.isLoading,
    error: ticketsQuery.error,
    refetch: ticketsQuery.refetch,
    releaseTicket: releaseMutation.mutateAsync,
    isReleasing: releaseMutation.isPending,
  };
}
