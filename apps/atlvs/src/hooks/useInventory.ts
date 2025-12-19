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

// =============================================================================
// INVENTORY SCAN HOOK
// =============================================================================

interface ScanInput {
  barcode: string;
  action: 'lookup' | 'check_out' | 'check_in';
  booking_id?: string;
  checked_out_to?: string;
  notes?: string;
}

interface ScanResult {
  success: boolean;
  action: string;
  item?: {
    id: string;
    name: string;
    sku: string;
    barcode?: string;
    category: string;
    quantity_total: number;
    quantity_available: number;
    location?: string;
    status: string;
  };
  transaction?: {
    id: string;
  };
  remaining_quantity?: number;
  available_quantity?: number;
  error?: string;
}

export function useInventoryScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ScanInput): Promise<ScanResult> => {
      const response = await fetch('/api/inventory/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Scan failed');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-availability'] });
    },
  });
}

// =============================================================================
// INVENTORY AVAILABILITY HOOK
// =============================================================================

interface AvailabilityFilters {
  start_date?: string;
  end_date?: string;
  item_id?: string;
  category_id?: string;
}

interface AvailabilityItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity_total: number;
  quantity_available: number;
  quantity_reserved: number;
  quantity_free: number;
  utilization_rate: number;
  is_available: boolean;
  unit_cost?: number;
}

interface AvailabilityResponse {
  items: AvailabilityItem[];
  summary: {
    total_items: number;
    available_items: number;
    fully_booked_items: number;
    average_utilization: number;
  };
  date_range: { start: string; end: string } | null;
}

export function useInventoryAvailability(filters?: AvailabilityFilters) {
  return useQuery({
    queryKey: ['inventory-availability', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.item_id) params.append('item_id', filters.item_id);
      if (filters?.category_id) params.append('category_id', filters.category_id);

      const response = await fetch(`/api/inventory/availability?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch inventory availability');
      }
      return response.json() as Promise<AvailabilityResponse>;
    },
  });
}
