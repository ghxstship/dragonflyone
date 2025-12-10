'use client';

import { useQuery, useMutation } from '@tanstack/react-query';

export interface DeliveryStep {
  status: 'completed' | 'current' | 'pending';
  title: string;
  description: string;
  timestamp?: string;
}

export interface TicketDelivery {
  id: string;
  order_id: string;
  event_title: string;
  event_date: string;
  delivery_method: 'email' | 'mobile' | 'physical' | 'will_call';
  delivery_status: 'processing' | 'sent' | 'delivered' | 'ready';
  tracking_number?: string;
  carrier?: string;
  estimated_delivery?: string;
  delivered_at?: string;
  recipient_email?: string;
  recipient_name?: string;
  steps: DeliveryStep[];
}

const DEMO_DELIVERIES: TicketDelivery[] = [
  {
    id: '1',
    order_id: 'ORD-001',
    event_title: 'Summer Festival 2024',
    event_date: new Date(Date.now() + 30 * 86400000).toISOString(),
    delivery_method: 'email',
    delivery_status: 'delivered',
    steps: [
      { status: 'completed', title: 'Order Confirmed', description: 'Your order has been confirmed', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { status: 'completed', title: 'Tickets Generated', description: 'Your tickets have been generated', timestamp: new Date(Date.now() - 43200000).toISOString() },
      { status: 'completed', title: 'Delivered', description: 'Tickets sent to your email', timestamp: new Date().toISOString() },
    ],
  },
];

export const ticketTrackingKeys = {
  all: ['ticket-tracking'] as const,
  deliveries: () => [...ticketTrackingKeys.all, 'deliveries'] as const,
  search: (code: string) => [...ticketTrackingKeys.all, 'search', code] as const,
};

export function useTicketDeliveries() {
  return useQuery({
    queryKey: ticketTrackingKeys.deliveries(),
    queryFn: async () => {
      const response = await fetch('/api/tickets/deliveries');
      if (!response.ok) return DEMO_DELIVERIES;
      const data = await response.json();
      return data.deliveries || DEMO_DELIVERIES;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useTrackingSearch() {
  return useMutation({
    mutationFn: async (trackingCode: string) => {
      const response = await fetch(`/api/tickets/track/${trackingCode}`);
      if (!response.ok) throw new Error('Tracking code not found');
      const data = await response.json();
      return data.delivery as TicketDelivery;
    },
  });
}

export function useTicketTrackingData() {
  const deliveriesQuery = useTicketDeliveries();
  const searchMutation = useTrackingSearch();

  return {
    deliveries: deliveriesQuery.data || [],
    isLoading: deliveriesQuery.isLoading,
    error: deliveriesQuery.error,
    refetch: deliveriesQuery.refetch,
    searchTracking: searchMutation.mutateAsync,
    isSearching: searchMutation.isPending,
    searchResult: searchMutation.data,
    searchError: searchMutation.error,
  };
}
