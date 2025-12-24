import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Booking {
  id: string;
  organization_id: string;
  lead_id?: string;
  contact_id: string;
  venue_id: string;
  event_type?: string;
  event_name?: string;
  status: 'draft' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  event_date: string;
  start_time?: string;
  end_time?: string;
  setup_time?: string;
  breakdown_time?: string;
  guest_count_expected?: number;
  guest_count_guaranteed?: number;
  package_id?: string;
  line_items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
    category?: string;
  }>;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  service_charge_rate: number;
  service_charge_amount: number;
  discount_amount: number;
  total_amount: number;
  deposit_required: number;
  special_requests?: string;
  internal_notes?: string;
  dietary_notes?: string;
  created_at: string;
  updated_at: string;
  contact?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    company?: string;
  };
  venue?: {
    id: string;
    name: string;
    city?: string;
  };
}

export interface BookingSummary {
  total: number;
  by_status: {
    draft: number;
    pending: number;
    confirmed: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  total_revenue: number;
}

export interface BookingsResponse {
  bookings: Booking[];
  summary: BookingSummary;
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

const API_BASE = '/api/bookings';

async function fetchBookings(params?: {
  organization_id?: string;
  venue_id?: string;
  status?: string;
  contact_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}): Promise<BookingsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.organization_id) searchParams.set('organization_id', params.organization_id);
  if (params?.venue_id) searchParams.set('venue_id', params.venue_id);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.contact_id) searchParams.set('contact_id', params.contact_id);
  if (params?.start_date) searchParams.set('start_date', params.start_date);
  if (params?.end_date) searchParams.set('end_date', params.end_date);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch bookings');
  }

  return response.json();
}

async function fetchBooking(id: string): Promise<Booking> {
  const response = await fetch(`${API_BASE}/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch booking');
  }

  const { booking } = await response.json();
  return booking;
}

async function createBooking(data: Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'contact' | 'venue'>): Promise<Booking> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create booking');
  }

  const { booking } = await response.json();
  return booking;
}

async function updateBooking(id: string, data: Partial<Booking>): Promise<Booking> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update booking');
  }

  const { booking } = await response.json();
  return booking;
}

async function deleteBooking(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete booking');
  }
}

export function useBookingsQuery(params?: {
  organization_id?: string;
  venue_id?: string;
  status?: string;
  contact_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => fetchBookings(params),
    staleTime: 60000,
  });
}

export function useBookingQuery(id: string) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => fetchBooking(id),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Booking> & { id: string }) =>
      updateBooking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useBookings(params?: {
  organization_id?: string;
  venue_id?: string;
  status?: string;
  contact_id?: string;
  start_date?: string;
  end_date?: string;
}) {
  const bookingsQuery = useBookingsQuery(params);
  const createMutation = useCreateBooking();
  const updateMutation = useUpdateBooking();
  const deleteMutation = useDeleteBooking();

  return {
    bookings: bookingsQuery.data?.bookings || [],
    summary: bookingsQuery.data?.summary || null,
    pagination: bookingsQuery.data?.pagination || null,
    isLoading: bookingsQuery.isLoading,
    error: bookingsQuery.error,
    refetch: bookingsQuery.refetch,
    createBooking: createMutation.mutate,
    createBookingAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateBooking: updateMutation.mutate,
    updateBookingAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteBooking: deleteMutation.mutate,
    deleteBookingAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
