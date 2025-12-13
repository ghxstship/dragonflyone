'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Order {
  id: string;
  organization_id: string;
  user_id?: string;
  event_id?: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  subtotal: number;
  tax: number;
  fees: number;
  total_amount: number;
  currency: string;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  billing_name?: string;
  billing_email?: string;
  billing_phone?: string;
  notes?: string;
  events?: {
    id: string;
    name: string;
  };
  platform_users?: {
    id: string;
    email: string;
    full_name?: string;
  };
  created_at: string;
  updated_at?: string;
}

interface OrderFilters {
  event_id?: string;
  user_id?: string;
  status?: string;
  payment_status?: string;
}

export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.event_id) params.append('event_id', filters.event_id);
      if (filters?.user_id) params.append('user_id', filters.user_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.payment_status) params.append('payment_status', filters.payment_status);

      const response = await fetch(`/api/orders?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      return data.orders || [];
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      const data = await response.json();
      return data.order;
    },
    enabled: !!id,
  });
}

interface CreateOrderInput {
  organization_id: string;
  user_id?: string;
  event_id?: string;
  order_number: string;
  status?: string;
  subtotal?: number;
  tax?: number;
  fees?: number;
  total_amount?: number;
  currency?: string;
  payment_method?: string;
  payment_status?: string;
  billing_name?: string;
  billing_email?: string;
  billing_phone?: string;
  notes?: string;
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrderInput) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Order> & { id: string }) => {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update order');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete order');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
