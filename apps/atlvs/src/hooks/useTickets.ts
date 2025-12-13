'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Ticket {
  id: string;
  organization_id: string;
  event_id: string;
  ticket_type: 'general' | 'vip' | 'early_bird' | 'group' | 'student' | 'senior' | 'member';
  name: string;
  description?: string;
  price: number;
  currency: string;
  quantity_available?: number;
  quantity_sold: number;
  max_per_order: number;
  sale_start?: string;
  sale_end?: string;
  status: 'draft' | 'active' | 'paused' | 'sold_out' | 'ended';
  events?: {
    id: string;
    name: string;
    start_date?: string;
  };
  created_at: string;
  updated_at?: string;
}

interface TicketFilters {
  event_id?: string;
  status?: string;
  ticket_type?: string;
}

export function useTickets(filters?: TicketFilters) {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.event_id) params.append('event_id', filters.event_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.ticket_type) params.append('ticket_type', filters.ticket_type);

      const response = await fetch(`/api/tickets?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      const data = await response.json();
      return data.tickets || [];
    },
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: async () => {
      const response = await fetch(`/api/tickets/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ticket');
      }
      const data = await response.json();
      return data.ticket;
    },
    enabled: !!id,
  });
}

interface CreateTicketInput {
  organization_id: string;
  event_id: string;
  ticket_type?: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  quantity_available?: number;
  max_per_order?: number;
  sale_start?: string;
  sale_end?: string;
  status?: string;
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTicketInput) => {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Ticket> & { id: string }) => {
      const response = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update ticket');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', variables.id] });
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/tickets/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete ticket');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}
