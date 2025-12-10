'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CartItem {
  id: string;
  event_title: string;
  ticket_type_name: string;
  price: number;
  qty: number;
  ticket_type_id: string;
  event_id: string;
}

export interface OrderData {
  items: CartItem[];
  payment: {
    cardName: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
  };
  billing: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

const DEMO_CART: CartItem[] = [
  {
    id: 'demo-1',
    event_title: 'Summer Music Festival',
    ticket_type_name: 'VIP Pass',
    price: 299.00,
    qty: 2,
    ticket_type_id: 'vip-001',
    event_id: 'evt-001',
  },
];

export const checkoutKeys = {
  all: ['checkout'] as const,
  cart: (eventId?: string, ticketId?: string) => [...checkoutKeys.all, 'cart', eventId, ticketId] as const,
};

export function useCartItems(eventId?: string, ticketId?: string, qty?: number) {
  return useQuery({
    queryKey: checkoutKeys.cart(eventId, ticketId),
    queryFn: async () => {
      if (!eventId || !ticketId) return DEMO_CART;
      const response = await fetch(`/api/checkout/cart?event=${eventId}&ticket=${ticketId}&qty=${qty || 1}`);
      if (!response.ok) return DEMO_CART;
      const data = await response.json();
      return data.items || DEMO_CART;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useProcessOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: OrderData) => {
      const response = await fetch('/api/checkout/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Payment processing failed');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checkoutKeys.all });
    },
  });
}

export function useCheckoutData(eventId?: string, ticketId?: string, qty?: number) {
  const cartQuery = useCartItems(eventId, ticketId, qty);
  const processMutation = useProcessOrder();

  return {
    cartItems: cartQuery.data || [],
    isLoading: cartQuery.isLoading,
    error: cartQuery.error,
    processOrder: processMutation.mutateAsync,
    isProcessing: processMutation.isPending,
    orderResult: processMutation.data,
    orderError: processMutation.error,
  };
}
