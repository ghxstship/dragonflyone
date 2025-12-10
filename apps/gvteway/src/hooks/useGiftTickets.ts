'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface GiftEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  available: number;
}

const DEMO_EVENTS: GiftEvent[] = [
  { id: '1', title: 'Summer Festival 2024', date: new Date(Date.now() + 30 * 86400000).toISOString(), venue: 'Central Park' },
  { id: '2', title: 'Jazz Night', date: new Date(Date.now() + 45 * 86400000).toISOString(), venue: 'Blue Note' },
];

const DEMO_TICKET_TYPES: TicketType[] = [
  { id: 't1', name: 'General Admission', price: 75, available: 100 },
  { id: 't2', name: 'VIP', price: 150, available: 25 },
];

export const giftTicketsKeys = {
  all: ['gift-tickets'] as const,
  events: () => [...giftTicketsKeys.all, 'events'] as const,
  ticketTypes: (eventId: string) => [...giftTicketsKeys.all, 'ticket-types', eventId] as const,
};

export function useGiftEvents() {
  return useQuery({
    queryKey: giftTicketsKeys.events(),
    queryFn: async () => {
      const response = await fetch('/api/events?status=published&limit=50');
      if (!response.ok) return DEMO_EVENTS;
      const data = await response.json();
      return data.events || DEMO_EVENTS;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTicketTypes(eventId: string | null) {
  return useQuery({
    queryKey: giftTicketsKeys.ticketTypes(eventId || ''),
    queryFn: async () => {
      if (!eventId) return [];
      const response = await fetch(`/api/events/${eventId}/ticket-types`);
      if (!response.ok) return DEMO_TICKET_TYPES;
      const data = await response.json();
      return data.ticket_types || DEMO_TICKET_TYPES;
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSendGiftTickets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gift: { event_id: string; ticket_type_id: string; quantity: number; recipient_email: string; recipient_name: string; sender_name: string; message?: string; delivery_date?: string; wrap_style?: string }) => {
      const response = await fetch('/api/tickets/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gift),
      });
      if (!response.ok) throw new Error('Failed to send gift tickets');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: giftTicketsKeys.all });
    },
  });
}

export function useGiftTicketsData(initialEventId: string | null) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(initialEventId);
  const eventsQuery = useGiftEvents();
  const ticketTypesQuery = useTicketTypes(selectedEventId);
  const sendMutation = useSendGiftTickets();

  return {
    events: eventsQuery.data || [],
    ticketTypes: ticketTypesQuery.data || [],
    isLoading: eventsQuery.isLoading,
    isLoadingTickets: ticketTypesQuery.isLoading,
    error: eventsQuery.error,
    sendGift: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
    setSelectedEventId,
  };
}
