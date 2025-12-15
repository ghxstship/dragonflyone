import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface RentalEquipment {
  id: string;
  name: string;
  category: string;
  vendor: string;
  projectId?: string;
  projectName: string;
  rentalStart: string;
  rentalEnd: string;
  dailyRate: number;
  totalCost: number;
  status: 'On Rent' | 'Reserved' | 'Returned' | 'Overdue';
  condition: string;
  poNumber?: string;
  notes?: string;
}

export interface CreateRentalParams {
  name: string;
  category: string;
  vendor: string;
  project_id?: string;
  rental_start: string;
  rental_end: string;
  daily_rate: number;
  notes?: string;
}

const API_BASE = '/api/rentals';

async function fetchRentals(params?: {
  status?: string;
  category?: string;
  vendor?: string;
}): Promise<RentalEquipment[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.vendor) searchParams.set('vendor', params.vendor);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch rentals');
  }

  const { data } = await response.json();

  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    name: item.name as string || item.equipment_name as string,
    category: item.category as string,
    vendor: item.vendor as string || item.vendor_name as string,
    projectId: item.project_id as string | undefined,
    projectName: ((item.project as Record<string, unknown>)?.name || item.project_name || 'N/A') as string,
    rentalStart: item.rental_start as string || item.start_date as string,
    rentalEnd: item.rental_end as string || item.end_date as string,
    dailyRate: item.daily_rate as number || 0,
    totalCost: item.total_cost as number || 0,
    status: item.status as RentalEquipment['status'],
    condition: item.condition as string || 'Good',
    poNumber: item.po_number as string | undefined,
    notes: item.notes as string | undefined,
  }));
}

async function createRental(params: CreateRentalParams): Promise<RentalEquipment> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create rental');
  }

  const { data } = await response.json();
  return data;
}

async function updateRental(id: string, updates: Partial<CreateRentalParams & { status: string }>): Promise<RentalEquipment> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update rental');
  }

  const { data } = await response.json();
  return data;
}

async function deleteRentals(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete rentals');
  }
}

async function returnRentals(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk-return`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to return rentals');
  }
}

export function useRentalsQuery(params?: {
  status?: string;
  category?: string;
  vendor?: string;
}) {
  return useQuery({
    queryKey: ['rentals', params],
    queryFn: () => fetchRentals(params),
    staleTime: 60000,
  });
}

export function useCreateRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRental,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
    },
  });
}

export function useUpdateRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateRentalParams & { status: string }> }) =>
      updateRental(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
    },
  });
}

export function useDeleteRentals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRentals,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
    },
  });
}

export function useReturnRentals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: returnRentals,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
    },
  });
}

export function useRentals() {
  const rentalsQuery = useRentalsQuery();
  const createMutation = useCreateRental();
  const updateMutation = useUpdateRental();
  const deleteMutation = useDeleteRentals();
  const returnMutation = useReturnRentals();

  return {
    rentals: rentalsQuery.data || [],
    isLoading: rentalsQuery.isLoading,
    error: rentalsQuery.error,
    refetch: rentalsQuery.refetch,
    createRental: createMutation.mutate,
    createRentalAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateRental: updateMutation.mutate,
    updateRentalAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteRentals: deleteMutation.mutate,
    deleteRentalsAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    returnRentals: returnMutation.mutate,
    returnRentalsAsync: returnMutation.mutateAsync,
    isReturning: returnMutation.isPending,
  };
}
