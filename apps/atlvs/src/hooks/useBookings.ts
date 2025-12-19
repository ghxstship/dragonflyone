'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type BookingStatus = 'draft' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface BookingSpace {
  space_id: string;
  setup_type?: string;
  capacity?: number;
  rental_amount?: number;
  notes?: string;
  space?: {
    id: string;
    name: string;
  };
}

export interface BookingLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  category?: string;
}

export interface Booking {
  id: string;
  organization_id: string;
  booking_number: string;
  lead_id?: string;
  contact_id: string;
  venue_id: string;
  event_type?: string;
  event_name?: string;
  status: BookingStatus;
  event_date: string;
  start_time?: string;
  end_time?: string;
  setup_time?: string;
  breakdown_time?: string;
  guest_count_expected?: number;
  guest_count_guaranteed?: number;
  guest_count_actual?: number;
  package_id?: string;
  line_items: BookingLineItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  service_charge_rate: number;
  service_charge_amount: number;
  discount_amount: number;
  total_amount: number;
  deposit_required: number;
  deposit_paid: number;
  balance_due: number;
  payment_status: string;
  special_requests?: string;
  internal_notes?: string;
  dietary_notes?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  confirmed_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  contact?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  venue?: {
    id: string;
    name: string;
    city?: string;
  };
  booking_spaces?: BookingSpace[];
}

export interface CreateBookingInput {
  organization_id: string;
  lead_id?: string;
  contact_id: string;
  venue_id: string;
  event_type?: string;
  event_name?: string;
  status?: BookingStatus;
  event_date: string;
  start_time?: string;
  end_time?: string;
  guest_count_expected?: number;
  line_items?: BookingLineItem[];
  subtotal?: number;
  tax_rate?: number;
  tax_amount?: number;
  total_amount?: number;
  deposit_required?: number;
  special_requests?: string;
  spaces?: BookingSpace[];
}

export interface UpdateBookingInput {
  event_type?: string;
  event_name?: string;
  status?: BookingStatus;
  event_date?: string;
  start_time?: string;
  end_time?: string;
  guest_count_expected?: number;
  guest_count_guaranteed?: number;
  guest_count_actual?: number;
  line_items?: BookingLineItem[];
  subtotal?: number;
  tax_rate?: number;
  tax_amount?: number;
  total_amount?: number;
  deposit_required?: number;
  deposit_paid?: number;
  payment_status?: string;
  special_requests?: string;
  internal_notes?: string;
  dietary_notes?: string;
  cancellation_reason?: string;
}

export interface BookingsFilters {
  organization_id?: string;
  venue_id?: string;
  status?: string;
  contact_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

interface BookingsResponse {
  bookings: Booking[];
  summary: {
    total: number;
    by_status: Record<string, number>;
    total_revenue: number;
  };
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

const fetchBookings = async (filters: BookingsFilters): Promise<BookingsResponse> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });

  const response = await fetch(`/api/bookings?${params}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch bookings');
  }
  return response.json();
};

const fetchBooking = async (id: string): Promise<Booking> => {
  const response = await fetch(`/api/bookings/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch booking');
  }
  const data = await response.json();
  return data.booking;
};

const createBooking = async (input: CreateBookingInput): Promise<Booking> => {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create booking');
  }
  const data = await response.json();
  return data.booking;
};

const updateBooking = async ({ id, ...input }: UpdateBookingInput & { id: string }): Promise<Booking> => {
  const response = await fetch(`/api/bookings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update booking');
  }
  const data = await response.json();
  return data.booking;
};

const cancelBooking = async (id: string): Promise<void> => {
  const response = await fetch(`/api/bookings/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to cancel booking');
  }
};

export function useBookings(filters: BookingsFilters = {}) {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => fetchBookings(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['booking', id],
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
    mutationFn: updateBooking,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.setQueryData(['booking', data.id], data);
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete booking');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCloneBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await fetch(`/api/bookings/${bookingId}/clone`, {
        method: 'POST',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to clone booking');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
