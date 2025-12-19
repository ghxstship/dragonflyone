'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface PurchaseOrder {
  id: string;
  po_number: string;
  vendor_id?: string;
  vendor?: { id: string; name: string };
  project_id?: string;
  status: string;
  category: string;
  priority: string;
  description?: string;
  total_amount: number;
  created_at: string;
  updated_at?: string;
}

interface PurchaseOrderFilters {
  projectId?: string;
  vendorId?: string;
  status?: string;
  category?: string;
}

export function usePurchaseOrders(filters?: PurchaseOrderFilters) {
  return useQuery({
    queryKey: ['purchase-orders', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.projectId) params.append('project_id', filters.projectId);
      if (filters?.vendorId) params.append('vendor_id', filters.vendorId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.category) params.append('category', filters.category);

      const response = await fetch(`/api/purchase-orders?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch purchase orders');
      }
      const data = await response.json();
      return data.purchase_orders || [];
    },
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: ['purchase-orders', id],
    queryFn: async () => {
      const response = await fetch(`/api/purchase-orders/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch purchase order');
      }
      const data = await response.json();
      return data.purchaseOrder;
    },
    enabled: !!id,
  });
}

interface CreatePurchaseOrderInput {
  vendor_id: string;
  project_id?: string;
  description: string;
  category: string;
  priority?: string;
  notes?: string;
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePurchaseOrderInput) => {
      const response = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create purchase order');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PurchaseOrder> & { id: string }) => {
      const response = await fetch(`/api/purchase-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update purchase order');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', variables.id] });
    },
  });
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/purchase-orders/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete purchase order');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
}

interface ReceiveItemInput {
  item_id: string;
  quantity_received: number;
  notes?: string;
}

interface ReceivePurchaseOrderInput {
  id: string;
  received_items: ReceiveItemInput[];
  received_by?: string;
  receipt_date?: string;
  notes?: string;
}

export function useReceivePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: ReceivePurchaseOrderInput) => {
      const response = await fetch(`/api/purchase-orders/${id}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to record receipt');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', variables.id] });
    },
  });
}
