'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Ticket {
  id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  ticket_type: string;
  seat_info?: string;
  status: 'active' | 'transferred' | 'used';
  qr_code: string;
}

export interface TransferData {
  ticket_id: string;
  recipient_email: string;
  recipient_name?: string;
  message?: string;
}

const DEMO_TICKETS: Ticket[] = [
  {
    id: 'tkt-001',
    event_id: 'evt-001',
    event_title: 'Summer Music Festival',
    event_date: '2024-07-15',
    ticket_type: 'VIP',
    status: 'active',
    qr_code: 'QR123',
  },
];

export const ticketTransferKeys = {
  all: ['ticket-transfer'] as const,
  transferable: () => [...ticketTransferKeys.all, 'transferable'] as const,
};

export function useTransferableTickets() {
  return useQuery({
    queryKey: ticketTransferKeys.transferable(),
    queryFn: async () => {
      const response = await fetch('/api/tickets?status=active&transferable=true');
      if (!response.ok) return DEMO_TICKETS;
      const data = await response.json();
      return data.tickets || DEMO_TICKETS;
    },
    staleTime: 60 * 1000,
  });
}

export function useTransferTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TransferData) => {
      const response = await fetch('/api/tickets/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Transfer failed');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketTransferKeys.all });
    },
  });
}

export function useTicketTransferData() {
  const ticketsQuery = useTransferableTickets();
  const transferMutation = useTransferTicket();

  return {
    tickets: ticketsQuery.data || [],
    isLoading: ticketsQuery.isLoading,
    error: ticketsQuery.error,
    refetch: ticketsQuery.refetch,
    transferTicket: transferMutation.mutateAsync,
    isTransferring: transferMutation.isPending,
  };
}
