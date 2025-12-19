import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface BookingPackage {
  id: string;
  name: string;
  description?: string;
  event_type: string;
  base_price: number;
  per_person_price?: number;
  min_guests?: number;
  max_guests?: number;
  duration_hours: number;
  included_items: Array<{
    id: string;
    name: string;
    quantity: number;
    type: 'space' | 'service' | 'equipment' | 'catering';
  }>;
  optional_add_ons: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  terms?: string;
  is_active: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingPackageInput {
  name: string;
  description?: string;
  event_type: string;
  base_price: number;
  per_person_price?: number;
  min_guests?: number;
  max_guests?: number;
  duration_hours?: number;
  included_items?: BookingPackage['included_items'];
  optional_add_ons?: BookingPackage['optional_add_ons'];
  terms?: string;
  is_active?: boolean;
}

export interface UpdateBookingPackageInput extends Partial<CreateBookingPackageInput> {
  id: string;
}

async function fetchBookingPackages(filters?: { event_type?: string; active_only?: boolean }): Promise<{ packages: BookingPackage[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.event_type) {
    params.set('event_type', filters.event_type);
  }
  if (filters?.active_only) {
    params.set('active_only', 'true');
  }

  const response = await fetch(`/api/booking-packages?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch booking packages');
  }
  return response.json();
}

async function fetchBookingPackage(id: string): Promise<BookingPackage> {
  const response = await fetch(`/api/booking-packages/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch booking package');
  }
  return response.json();
}

async function createBookingPackage(input: CreateBookingPackageInput): Promise<BookingPackage> {
  const response = await fetch('/api/booking-packages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create booking package');
  }
  return response.json();
}

async function updateBookingPackage({ id, ...input }: UpdateBookingPackageInput): Promise<BookingPackage> {
  const response = await fetch(`/api/booking-packages/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update booking package');
  }
  return response.json();
}

async function deleteBookingPackage(id: string): Promise<void> {
  const response = await fetch(`/api/booking-packages/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete booking package');
  }
}

export function useBookingPackages(filters?: { event_type?: string; active_only?: boolean }) {
  return useQuery({
    queryKey: ['booking-packages', filters],
    queryFn: () => fetchBookingPackages(filters),
  });
}

export function useBookingPackage(id: string) {
  return useQuery({
    queryKey: ['booking-package', id],
    queryFn: () => fetchBookingPackage(id),
    enabled: !!id,
  });
}

export function useCreateBookingPackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBookingPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-packages'] });
    },
  });
}

export function useUpdateBookingPackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBookingPackage,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['booking-packages'] });
      queryClient.invalidateQueries({ queryKey: ['booking-package', data.id] });
    },
  });
}

export function useDeleteBookingPackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBookingPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-packages'] });
    },
  });
}
