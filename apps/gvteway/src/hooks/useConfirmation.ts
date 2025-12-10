'use client';

import { useQuery } from '@tanstack/react-query';

export interface OrderItem {
  id: string;
  event_name: string;
  event_date: string;
  venue_name: string;
  ticket_type: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface OrderDetails {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  items: OrderItem[];
  subtotal: number;
  fees: number;
  taxes: number;
  discount: number;
  total: number;
  payment_method: string;
  billing_email: string;
}

export const confirmationKeys = {
  all: ['confirmation'] as const,
  order: (orderId: string) => [...confirmationKeys.all, 'order', orderId] as const,
};

export function useOrderConfirmation(orderId: string | null) {
  return useQuery({
    queryKey: confirmationKeys.order(orderId || ''),
    queryFn: async () => {
      if (!orderId) return null;
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) throw new Error('Failed to fetch order');
      const data = await response.json();
      return data.order as OrderDetails;
    },
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useConfirmationData(orderId: string | null) {
  const orderQuery = useOrderConfirmation(orderId);

  return {
    order: orderQuery.data || null,
    isLoading: orderQuery.isLoading,
    error: orderQuery.error,
    refetch: orderQuery.refetch,
  };
}
