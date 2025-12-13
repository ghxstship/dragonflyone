'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface InventoryItem {
  id: string;
  product_id: string;
  location_id?: string;
  min_quantity: number;
  max_quantity?: number;
  reorder_point?: number;
  reorder_quantity?: number;
  created_at: string;
  location?: {
    id: string;
    name: string;
    type: string;
  };
}

export interface InventoryAlert {
  id: string;
  product_id: string;
  location_id?: string;
  alert_type: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiring';
  threshold?: number;
  current_quantity?: number;
  status: 'active' | 'acknowledged' | 'resolved';
  created_at: string;
}

export interface InventoryAdjustment {
  product_id: string;
  location_id?: string;
  adjustment_type: 'add' | 'remove' | 'transfer' | 'count' | 'damage' | 'return';
  quantity: number;
  reason?: string;
}

interface InventoryFilters {
  location_id?: string;
  category?: string;
  low_stock?: boolean;
}

interface InventoryResponse {
  inventory: InventoryItem[];
  alerts: InventoryAlert[];
  summary: {
    total_items: number;
    low_stock_alerts: number;
    out_of_stock_alerts: number;
    total_alerts: number;
  };
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export function useInventory(filters?: InventoryFilters) {
  return useQuery({
    queryKey: ['inventory', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.location_id) params.append('location_id', filters.location_id);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.low_stock) params.append('low_stock', 'true');

      const response = await fetch(`/api/inventory?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      return response.json() as Promise<InventoryResponse>;
    },
  });
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: ['inventory', id],
    queryFn: async () => {
      const response = await fetch(`/api/inventory/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch inventory item');
      }
      const data = await response.json();
      return data.item as InventoryItem;
    },
    enabled: !!id,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<InventoryItem, 'id' | 'created_at' | 'location'>) => {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!response.ok) {
        throw new Error('Failed to create inventory item');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useAdjustInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adjustment: InventoryAdjustment) => {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'adjust', ...adjustment }),
      });
      if (!response.ok) {
        throw new Error('Failed to adjust inventory');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InventoryItem> & { id: string }) => {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update inventory item');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', variables.id] });
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete inventory item');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
