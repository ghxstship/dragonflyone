'use client';

import { useQuery } from '@tanstack/react-query';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  type: 'ticket' | 'merchandise' | 'addon';
}

export interface Order {
  id: string;
  order_number: string;
  event_title: string;
  event_date: string;
  event_venue: string;
  event_image?: string;
  items: OrderItem[];
  subtotal: number;
  fees: number;
  tax: number;
  total: number;
  status: 'completed' | 'pending' | 'cancelled' | 'refunded';
  payment_method: string;
  created_at: string;
}

const DEMO_ORDERS: Order[] = [
  { id: '1', order_number: 'ORD-001', event_title: 'Summer Festival 2024', event_date: new Date(Date.now() + 30 * 86400000).toISOString(), event_venue: 'Central Park', items: [{ id: 'i1', name: 'GA Ticket', quantity: 2, price: 75, type: 'ticket' }], subtotal: 150, fees: 15, tax: 12, total: 177, status: 'completed', payment_method: 'Visa ****4242', created_at: new Date(Date.now() - 86400000).toISOString() },
];

export const orderHistoryKeys = {
  all: ['order-history'] as const,
  list: (params?: { status?: string; period?: string }) => [...orderHistoryKeys.all, 'list', params] as const,
};

export function useOrderHistoryList(params?: { status?: string; period?: string }) {
  return useQuery({
    queryKey: orderHistoryKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.status && params.status !== 'all') searchParams.append('status', params.status);
      if (params?.period && params.period !== 'all') searchParams.append('period', params.period);
      const response = await fetch(`/api/orders/history?${searchParams.toString()}`);
      if (!response.ok) return DEMO_ORDERS;
      const data = await response.json();
      return data.orders || DEMO_ORDERS;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useOrderHistoryData(params?: { status?: string; period?: string }) {
  const ordersQuery = useOrderHistoryList(params);

  return {
    orders: ordersQuery.data || [],
    isLoading: ordersQuery.isLoading,
    error: ordersQuery.error,
    refetch: ordersQuery.refetch,
  };
}
