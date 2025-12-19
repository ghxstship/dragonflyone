import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface InventoryTransaction {
  id: string;
  item_id: string;
  item_name: string;
  item_sku: string;
  transaction_type: 'check_out' | 'check_in' | 'adjustment' | 'transfer' | 'maintenance' | 'write_off';
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  booking_id?: string;
  event_name?: string;
  location_from?: string;
  location_to?: string;
  checked_out_by?: string;
  checked_out_to?: string;
  expected_return_date?: string;
  actual_return_date?: string;
  condition_notes?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface TransactionFilters {
  item_id?: string;
  transaction_type?: InventoryTransaction['transaction_type'];
  booking_id?: string;
  start_date?: string;
  end_date?: string;
  created_by?: string;
}

export interface CheckOutInput {
  item_id: string;
  quantity: number;
  booking_id?: string;
  checked_out_to: string;
  expected_return_date?: string;
  notes?: string;
}

export interface CheckInInput {
  item_id: string;
  quantity: number;
  condition_notes?: string;
  notes?: string;
}

async function fetchTransactions(filters?: TransactionFilters): Promise<{
  transactions: InventoryTransaction[];
  total: number;
}> {
  const params = new URLSearchParams();
  if (filters?.item_id) params.set('item_id', filters.item_id);
  if (filters?.transaction_type) params.set('type', filters.transaction_type);
  if (filters?.booking_id) params.set('booking_id', filters.booking_id);
  if (filters?.start_date) params.set('start', filters.start_date);
  if (filters?.end_date) params.set('end', filters.end_date);
  if (filters?.created_by) params.set('created_by', filters.created_by);

  const response = await fetch(`/api/inventory/transactions?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch inventory transactions');
  }
  return response.json();
}

async function fetchItemHistory(itemId: string): Promise<{
  transactions: InventoryTransaction[];
  summary: {
    total_checkouts: number;
    total_checkins: number;
    current_status: 'available' | 'checked_out' | 'maintenance' | 'retired';
    days_in_use_this_month: number;
    utilization_rate: number;
  };
}> {
  const response = await fetch(`/api/inventory/${itemId}/history`);
  if (!response.ok) {
    throw new Error('Failed to fetch item history');
  }
  return response.json();
}

async function checkOutItem(input: CheckOutInput): Promise<InventoryTransaction> {
  const response = await fetch(`/api/inventory/${input.item_id}/check-out`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to check out item');
  }
  return response.json();
}

async function checkInItem(input: CheckInInput): Promise<InventoryTransaction> {
  const response = await fetch(`/api/inventory/${input.item_id}/check-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to check in item');
  }
  return response.json();
}

async function adjustInventory(input: {
  item_id: string;
  adjustment: number;
  reason: string;
  notes?: string;
}): Promise<InventoryTransaction> {
  const response = await fetch(`/api/inventory/${input.item_id}/adjust`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to adjust inventory');
  }
  return response.json();
}

export function useInventoryTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['inventory-transactions', filters],
    queryFn: () => fetchTransactions(filters),
  });
}

export function useItemHistory(itemId: string) {
  return useQuery({
    queryKey: ['inventory-item-history', itemId],
    queryFn: () => fetchItemHistory(itemId),
    enabled: !!itemId,
  });
}

export function useCheckOutItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkOutItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-item-history', data.item_id] });
    },
  });
}

export function useCheckInItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkInItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-item-history', data.item_id] });
    },
  });
}

export function useAdjustInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adjustInventory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-item-history', data.item_id] });
    },
  });
}
