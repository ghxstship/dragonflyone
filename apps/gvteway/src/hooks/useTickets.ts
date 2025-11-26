'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Ticket {
  id: string;
  event_id: string;
  event?: {
    title: string;
    name?: string;
    event_date: string;
    start_date?: string;
    venue?: string;
  };
  ticket_type_id: string;
  ticket_type?: {
    name: string;
    price: number;
  };
  price: number;
  seat_number?: string;
  status: 'available' | 'reserved' | 'sold' | 'cancelled';
  qr_code: string;
  buyer_id?: string;
  buyer?: {
    name: string;
    email: string;
  };
  purchase_date?: string;
  created_at: string;
}

export function useTickets(filters?: {
  event_id?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: async () => {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          event:events(title, event_date),
          ticket_type:ticket_types(name, price),
          buyer:users(name, email)
        `)
        .order('created_at', { ascending: false });

      if (filters?.event_id) {
        query = query.eq('event_id', filters.event_id);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Ticket[];
    },
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          event:events(title, event_date, venue_id),
          ticket_type:ticket_types(name, price),
          buyer:users(name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Ticket;
    },
    enabled: !!id,
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Ticket> & { id: string }) => {
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', data.id] });
    },
  });
}

export function useCancelTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('tickets')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

interface TicketStatRow {
  status: string;
  price: number;
}

export function useTicketStats(event_id?: string) {
  return useQuery({
    queryKey: ['ticket-stats', event_id],
    queryFn: async () => {
      let query = supabase
        .from('tickets')
        .select('status, price');

      if (event_id) {
        query = query.eq('event_id', event_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const tickets = (data || []) as TicketStatRow[];
      const stats = {
        total: tickets.length,
        available: tickets.filter((t: TicketStatRow) => t.status === 'available').length,
        sold: tickets.filter((t: TicketStatRow) => t.status === 'sold').length,
        reserved: tickets.filter((t: TicketStatRow) => t.status === 'reserved').length,
        revenue: tickets
          .filter((t: TicketStatRow) => t.status === 'sold')
          .reduce((sum: number, t: TicketStatRow) => sum + t.price, 0),
      };

      return stats;
    },
    enabled: true,
  });
}
