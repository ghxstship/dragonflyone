'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface VendorOrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  sku?: string;
  name: string;
  description?: string;
  quantity: number;
  unit?: string;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
  total: number;
  notes?: string;
  sort_order: number;
  created_at: string;
}

export interface VendorOrder {
  id: string;
  organization_id: string;
  vendor_profile_id: string;
  booking_id?: string;
  event_id?: string;
  order_number: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'acknowledged' | 'in_progress' | 'completed' | 'cancelled';
  order_date: string;
  delivery_date?: string;
  delivery_time?: string;
  delivery_location?: string;
  special_instructions?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  payment_terms?: string;
  payment_status: string;
  notes?: string;
  internal_notes?: string;
  sent_at?: string;
  acknowledged_at?: string;
  completed_at?: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  vendor?: {
    id: string;
    name: string;
    logo_url?: string;
    contact_info?: Record<string, unknown>;
  };
  booking?: {
    id: string;
    booking_number: string;
    event_name?: string;
    event_date?: string;
  };
  items?: VendorOrderItem[];
}

interface OrdersResponse {
  orders: VendorOrder[];
}

interface OrderFilters {
  organization_id: string;
  vendor_profile_id?: string;
  booking_id?: string;
  status?: string;
}

interface CreateOrderInput {
  organization_id: string;
  vendor_profile_id: string;
  booking_id?: string;
  event_id?: string;
  delivery_date?: string;
  delivery_time?: string;
  delivery_location?: string;
  special_instructions?: string;
  payment_terms?: string;
  notes?: string;
  items: Array<{
    product_id?: string;
    sku?: string;
    name: string;
    description?: string;
    quantity: number;
    unit?: string;
    unit_price: number;
    discount_percent?: number;
    tax_rate?: number;
    notes?: string;
  }>;
}

interface UpdateOrderInput {
  delivery_date?: string;
  delivery_time?: string;
  delivery_location?: string;
  special_instructions?: string;
  payment_terms?: string;
  notes?: string;
  internal_notes?: string;
  status?: VendorOrder['status'];
}

async function fetchOrders(filters: OrderFilters): Promise<OrdersResponse> {
  const params = new URLSearchParams();
  params.set('organization_id', filters.organization_id);
  if (filters.vendor_profile_id) params.set('vendor_profile_id', filters.vendor_profile_id);
  if (filters.booking_id) params.set('booking_id', filters.booking_id);
  if (filters.status) params.set('status', filters.status);

  const res = await fetch(`/api/vendor-orders?${params}`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

async function fetchOrder(id: string): Promise<{ order: VendorOrder }> {
  const res = await fetch(`/api/vendor-orders/${id}`);
  if (!res.ok) throw new Error('Failed to fetch order');
  return res.json();
}

async function createOrder(input: CreateOrderInput): Promise<{ order: VendorOrder }> {
  const res = await fetch('/api/vendor-orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to create order');
  return res.json();
}

async function updateOrder(id: string, input: UpdateOrderInput): Promise<{ order: VendorOrder }> {
  const res = await fetch(`/api/vendor-orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to update order');
  return res.json();
}

async function deleteOrder(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/vendor-orders/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete order');
  }
  return res.json();
}

export function useVendorOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: ['vendor-orders', filters],
    queryFn: () => fetchOrders(filters),
    enabled: !!filters.organization_id,
  });
}

export function useVendorOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['vendor-order', id],
    queryFn: () => fetchOrder(id!),
    enabled: !!id,
  });
}

export function useCreateVendorOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
    },
  });
}

export function useUpdateVendorOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOrderInput }) => updateOrder(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-order', id] });
    },
  });
}

export function useDeleteVendorOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
    },
  });
}

export function useSendVendorOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => updateOrder(id, { status: 'sent' }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-order', id] });
    },
  });
}

export function useApproveVendorOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => updateOrder(id, { status: 'approved' }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-order', id] });
    },
  });
}
