'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface SeatInfo {
  section: string;
  row: string;
  seat: string;
  gate?: string;
}

interface EventTicket {
  id: string;
  event_id: string;
  order_id: string;
  ticket_type: string;
  holder_name: string;
  holder_email: string;
  status: 'valid' | 'used' | 'cancelled' | 'transferred';
  confirmation_code: string;
  seat_info?: SeatInfo;
  qr_code?: string;
  created_at: string;
}

interface EventInfo {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  image_url?: string;
}

interface UseEventTicketsResult {
  tickets: EventTicket[];
  event: EventInfo | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useEventTickets(eventId: string): UseEventTicketsResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['event-tickets', eventId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const [ticketsResult, eventResult] = await Promise.all([
        supabase
          .from('tickets')
          .select('*')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('events')
          .select('id, name, start_date, start_time, venue_name')
          .eq('id', eventId)
          .single(),
      ]);

      if (ticketsResult.error) {
        throw ticketsResult.error;
      }

      const tickets: EventTicket[] = (ticketsResult.data || []).map(ticket => ({
        id: ticket.id,
        event_id: ticket.event_id,
        order_id: ticket.order_id || 'N/A',
        ticket_type: ticket.ticket_type || 'General Admission',
        holder_name: ticket.holder_name || user.email || 'Ticket Holder',
        holder_email: ticket.holder_email || user.email || '',
        status: ticket.status || 'valid',
        confirmation_code: ticket.confirmation_code || ticket.id.slice(0, 8).toUpperCase(),
        seat_info: ticket.seat_info,
        qr_code: ticket.qr_code,
        created_at: ticket.created_at,
      }));

      const event: EventInfo | null = eventResult.data ? {
        id: eventResult.data.id,
        name: eventResult.data.name,
        date: eventResult.data.start_date,
        time: eventResult.data.start_time,
        venue: eventResult.data.venue_name || 'Venue TBD',
      } : null;

      return { tickets, event };
    },
    enabled: !!eventId,
  });

  return {
    tickets: data?.tickets || [],
    event: data?.event || null,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
}
