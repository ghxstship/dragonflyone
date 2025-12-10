'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface InventoryLocation {
  id: string;
  name: string;
  type: 'warehouse' | 'store' | 'online';
  quantity: number;
  last_updated: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  online_quantity: number;
  physical_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  sync_status: 'synced' | 'pending' | 'conflict' | 'error';
  last_sync: string;
  locations: InventoryLocation[];
  [key: string]: unknown;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  type: 'manual' | 'auto' | 'scheduled';
  items_synced: number;
  conflicts: number;
  status: 'completed' | 'failed' | 'partial';
  duration_ms: number;
}

const defaultLocations: InventoryLocation[] = [
  { id: 'LOC-001', name: 'Main Warehouse', type: 'warehouse', quantity: 100, last_updated: '2024-11-24T14:30:00Z' },
  { id: 'LOC-002', name: 'Online Store', type: 'online', quantity: 50, last_updated: '2024-11-24T14:30:00Z' },
];

const DEMO_INVENTORY: InventoryItem[] = [
  { id: 'INV-001', sku: 'TSHIRT-BLK-M', name: 'Tour T-Shirt Black (M)', category: 'Apparel', online_quantity: 150, physical_quantity: 148, reserved_quantity: 12, available_quantity: 136, sync_status: 'synced', last_sync: '2024-11-24T14:30:00Z', locations: defaultLocations },
  { id: 'INV-002', sku: 'HOODIE-GRY-L', name: 'Tour Hoodie Gray (L)', category: 'Apparel', online_quantity: 75, physical_quantity: 72, reserved_quantity: 5, available_quantity: 67, sync_status: 'conflict', last_sync: '2024-11-24T14:28:00Z', locations: defaultLocations },
];

const DEMO_LOGS: SyncLog[] = [
  { id: 'LOG-001', timestamp: '2024-11-24T14:30:00Z', type: 'auto', items_synced: 5, conflicts: 1, status: 'completed', duration_ms: 1500 },
];

export const inventorySyncKeys = {
  all: ['inventory-sync'] as const,
  items: () => [...inventorySyncKeys.all, 'items'] as const,
  logs: () => [...inventorySyncKeys.all, 'logs'] as const,
};

export function useInventoryItems() {
  return useQuery({
    queryKey: inventorySyncKeys.items(),
    queryFn: async () => {
      const response = await fetch('/api/admin/inventory');
      if (!response.ok) return DEMO_INVENTORY;
      const data = await response.json();
      return data.items || DEMO_INVENTORY;
    },
    staleTime: 30 * 1000,
  });
}

export function useSyncLogs() {
  return useQuery({
    queryKey: inventorySyncKeys.logs(),
    queryFn: async () => {
      const response = await fetch('/api/admin/inventory/logs');
      if (!response.ok) return DEMO_LOGS;
      const data = await response.json();
      return data.logs || DEMO_LOGS;
    },
    staleTime: 30 * 1000,
  });
}

export function useSyncInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemIds?: string[]) => {
      const response = await fetch('/api/admin/inventory/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_ids: itemIds }),
      });
      if (!response.ok) throw new Error('Failed to sync inventory');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventorySyncKeys.all });
    },
  });
}

export function useInventorySyncData() {
  const itemsQuery = useInventoryItems();
  const logsQuery = useSyncLogs();
  const syncMutation = useSyncInventory();

  return {
    items: itemsQuery.data || [],
    logs: logsQuery.data || [],
    isLoading: itemsQuery.isLoading,
    error: itemsQuery.error,
    refetch: itemsQuery.refetch,
    syncInventory: syncMutation.mutateAsync,
    isSyncing: syncMutation.isPending,
  };
}
