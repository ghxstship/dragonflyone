import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  serial_number?: string;
  barcode?: string;
  status: 'available' | 'checked_out' | 'in_use' | 'maintenance' | 'retired';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  location: string;
  current_booking_id?: string;
  current_booking_name?: string;
  checked_out_by?: string;
  checked_out_at?: string;
  expected_return?: string;
  purchase_date?: string;
  purchase_price?: number;
  current_value?: number;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  notes?: string;
  images?: string[];
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface EquipmentCheckout {
  id: string;
  equipment_id: string;
  equipment_name: string;
  booking_id?: string;
  booking_name?: string;
  checked_out_by: string;
  checked_out_by_name: string;
  checked_out_at: string;
  expected_return: string;
  actual_return?: string;
  returned_by?: string;
  condition_out: EquipmentItem['condition'];
  condition_in?: EquipmentItem['condition'];
  notes_out?: string;
  notes_in?: string;
  status: 'active' | 'returned' | 'overdue';
}

export interface EquipmentFilters {
  category?: string;
  status?: EquipmentItem['status'];
  condition?: EquipmentItem['condition'];
  location?: string;
  available_only?: boolean;
  search?: string;
}

async function fetchEquipment(filters?: EquipmentFilters): Promise<{
  equipment: EquipmentItem[];
  total: number;
  summary: {
    available: number;
    checked_out: number;
    maintenance: number;
    by_category: Record<string, number>;
  };
}> {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.condition) params.set('condition', filters.condition);
  if (filters?.location) params.set('location', filters.location);
  if (filters?.available_only) params.set('available', 'true');
  if (filters?.search) params.set('q', filters.search);

  const response = await fetch(`/api/equipment?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch equipment');
  }
  return response.json();
}

async function fetchEquipmentItem(id: string): Promise<EquipmentItem & { checkout_history: EquipmentCheckout[] }> {
  const response = await fetch(`/api/equipment/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch equipment item');
  }
  return response.json();
}

async function checkoutEquipment(input: {
  equipmentId: string;
  bookingId?: string;
  expectedReturn: string;
  notes?: string;
}): Promise<EquipmentCheckout> {
  const response = await fetch(`/api/equipment/${input.equipmentId}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to checkout equipment');
  }
  return response.json();
}

async function returnEquipment(input: {
  equipmentId: string;
  condition: EquipmentItem['condition'];
  notes?: string;
}): Promise<EquipmentCheckout> {
  const response = await fetch(`/api/equipment/${input.equipmentId}/return`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to return equipment');
  }
  return response.json();
}

async function updateEquipmentStatus(input: {
  equipmentId: string;
  status: EquipmentItem['status'];
  notes?: string;
}): Promise<EquipmentItem> {
  const response = await fetch(`/api/equipment/${input.equipmentId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error('Failed to update status');
  }
  return response.json();
}

async function fetchOverdueEquipment(): Promise<{ overdue: EquipmentCheckout[] }> {
  const response = await fetch('/api/equipment/overdue');
  if (!response.ok) {
    throw new Error('Failed to fetch overdue equipment');
  }
  return response.json();
}

export function useEquipment(filters?: EquipmentFilters) {
  return useQuery({
    queryKey: ['equipment', filters],
    queryFn: () => fetchEquipment(filters),
  });
}

export function useEquipmentItem(id: string) {
  return useQuery({
    queryKey: ['equipment-item', id],
    queryFn: () => fetchEquipmentItem(id),
    enabled: !!id,
  });
}

export function useCheckoutEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkoutEquipment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-item', variables.equipmentId] });
    },
  });
}

export function useReturnEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: returnEquipment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-item', variables.equipmentId] });
      queryClient.invalidateQueries({ queryKey: ['overdue-equipment'] });
    },
  });
}

export function useUpdateEquipmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEquipmentStatus,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-item', variables.equipmentId] });
    },
  });
}

export function useOverdueEquipment() {
  return useQuery({
    queryKey: ['overdue-equipment'],
    queryFn: fetchOverdueEquipment,
  });
}
