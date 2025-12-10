'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { log } from '@ghxstship/config';

// Types
export interface CartItem {
  id: string;
  event_id: string;
  event_name: string;
  event_date: string;
  venue_name: string;
  ticket_type_id: string;
  ticket_type_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  fees: number;
  total: number;
}

export interface CartSummary {
  item_count: number;
  subtotal: number;
  service_fees: number;
  taxes: number;
  total: number;
}

export interface CartData {
  items: CartItem[];
  summary: CartSummary | null;
}

// Demo data
const DEMO_CART: CartData = {
  items: [
    {
      id: '1',
      event_id: 'e1',
      event_name: 'Summer Music Festival 2025',
      event_date: '2025-07-15',
      venue_name: 'Central Park',
      ticket_type_id: 't1',
      ticket_type_name: 'General Admission',
      quantity: 2,
      unit_price: 75,
      subtotal: 150,
      fees: 15,
      total: 165,
    },
  ],
  summary: {
    item_count: 2,
    subtotal: 150,
    service_fees: 15,
    taxes: 12,
    total: 177,
  },
};

// Query keys
export const cartKeys = {
  all: ['cart'] as const,
  items: () => [...cartKeys.all, 'items'] as const,
};

// Fetch functions
async function fetchCart(): Promise<CartData> {
  const response = await fetch('/api/cart');
  if (response.status === 401) {
    return DEMO_CART;
  }
  if (!response.ok) {
    throw new Error('Failed to fetch cart');
  }
  const data = await response.json();
  return {
    items: data.items || [],
    summary: data.summary || null,
  };
}

// Mutation functions
interface UpdateQuantityParams {
  itemId: string;
  quantity: number;
}

async function updateQuantity({ itemId, quantity }: UpdateQuantityParams): Promise<void> {
  const response = await fetch(`/api/cart/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });
  if (!response.ok) {
    throw new Error('Failed to update quantity');
  }
}

async function removeItem(itemId: string): Promise<void> {
  const response = await fetch(`/api/cart/${itemId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to remove item');
  }
}

interface ApplyPromoResult {
  discount: number;
}

async function applyPromo(code: string): Promise<ApplyPromoResult> {
  const response = await fetch('/api/cart/promo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!response.ok) {
    throw new Error('Promo code not valid');
  }
  return response.json();
}

// Hooks
export function useCart() {
  return useQuery({
    queryKey: cartKeys.items(),
    queryFn: fetchCart,
    staleTime: 60 * 1000, // 1 minute for cart
  });
}

export function useUpdateCartQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateQuantity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
    onError: (error) => {
      log.error('Failed to update quantity:', error);
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
    onError: (error) => {
      log.error('Failed to remove item:', error);
    },
  });
}

export function useApplyPromo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applyPromo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
    onError: (error) => {
      log.error('Failed to apply promo:', error);
    },
  });
}

// Combined hook
export function useCartData() {
  const cartQuery = useCart();
  const updateQuantityMutation = useUpdateCartQuantity();
  const removeItemMutation = useRemoveCartItem();
  const applyPromoMutation = useApplyPromo();

  return {
    // Data
    items: cartQuery.data?.items || [],
    summary: cartQuery.data?.summary || null,

    // Loading states
    isLoading: cartQuery.isLoading,
    error: cartQuery.error,

    // Mutations
    updateQuantity: updateQuantityMutation.mutateAsync,
    isUpdatingQuantity: updateQuantityMutation.isPending,

    removeItem: removeItemMutation.mutateAsync,
    isRemovingItem: removeItemMutation.isPending,

    applyPromo: applyPromoMutation.mutateAsync,
    isApplyingPromo: applyPromoMutation.isPending,

    // Refetch
    refetch: cartQuery.refetch,
  };
}
