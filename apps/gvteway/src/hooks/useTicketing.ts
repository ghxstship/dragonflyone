'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface TicketType {
  id: string;
  organization_id: string;
  event_id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  quantity_available?: number;
  quantity_sold: number;
  quantity_reserved: number;
  sales_start?: string;
  sales_end?: string;
  min_per_order: number;
  max_per_order: number;
  visibility: 'public' | 'hidden' | 'password' | 'invite_only';
  access_code?: string;
  sort_order: number;
  is_active: boolean;
  available?: number;
  on_sale?: boolean;
  created_at: string;
  updated_at: string;
}

export interface TicketOrder {
  id: string;
  organization_id: string;
  event_id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded' | 'partially_refunded';
  tickets: Array<{
    ticket_type_id: string;
    ticket_type_name: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  subtotal: number;
  fees: number;
  discount_amount: number;
  discount_code?: string;
  tax_amount: number;
  total: number;
  purchaser_name: string;
  purchaser_email: string;
  purchaser_phone?: string;
  created_at: string;
  event?: {
    id: string;
    name: string;
    start_date: string;
    venue_id?: string;
  };
}

export interface Ticket {
  id: string;
  organization_id: string;
  order_id: string;
  ticket_type_id: string;
  event_id: string;
  barcode: string;
  qr_code_url?: string;
  attendee_name?: string;
  attendee_email?: string;
  attendee_phone?: string;
  status: 'valid' | 'used' | 'cancelled' | 'transferred' | 'expired';
  checked_in_at?: string;
  seat_assignment?: Record<string, unknown>;
  created_at: string;
  ticket_type?: { id: string; name: string; price: number };
  order?: { id: string; order_number: string; purchaser_name: string; purchaser_email: string };
}

interface CreateOrderInput {
  event_id: string;
  tickets: Array<{
    ticket_type_id: string;
    quantity: number;
    attendees?: Array<{ name: string; email: string; phone?: string }>;
  }>;
  purchaser: { name: string; email: string; phone?: string };
  discount_code?: string;
  billing_address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

interface CheckInInput {
  method?: 'scan' | 'manual' | 'bulk';
  location?: string;
  device_info?: Record<string, unknown>;
  notes?: string;
}

async function fetchTicketTypes(eventId: string): Promise<{ ticket_types: TicketType[] }> {
  const res = await fetch(`/api/events/${eventId}/tickets`);
  if (!res.ok) throw new Error('Failed to fetch ticket types');
  return res.json();
}

async function fetchOrders(params?: {
  event_id?: string;
  email?: string;
  status?: string;
}): Promise<{ orders: TicketOrder[] }> {
  const searchParams = new URLSearchParams();
  if (params?.event_id) searchParams.set('event_id', params.event_id);
  if (params?.email) searchParams.set('email', params.email);
  if (params?.status) searchParams.set('status', params.status);

  const res = await fetch(`/api/ticket-orders?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

async function fetchGuestList(
  eventId: string,
  status?: string
): Promise<{ guests: Ticket[]; summary: { total: number; checked_in: number; pending: number; cancelled: number } }> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);

  const res = await fetch(`/api/events/${eventId}/guest-list?${params}`);
  if (!res.ok) throw new Error('Failed to fetch guest list');
  return res.json();
}

async function createOrder(input: CreateOrderInput): Promise<{ order: TicketOrder; tickets_created: number }> {
  const res = await fetch('/api/ticket-orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create order');
  }
  return res.json();
}

async function checkInTicket(
  ticketId: string,
  input?: CheckInInput
): Promise<{ success: boolean; ticket: Ticket }> {
  const res = await fetch(`/api/tickets/${ticketId}/check-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input || {}),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Check-in failed');
  }
  return res.json();
}

export function useTicketTypes(eventId: string | undefined) {
  return useQuery({
    queryKey: ['ticket-types', eventId],
    queryFn: () => fetchTicketTypes(eventId!),
    enabled: !!eventId,
  });
}

export function useTicketOrders(params?: { event_id?: string; email?: string; status?: string }) {
  return useQuery({
    queryKey: ['ticket-orders', params],
    queryFn: () => fetchOrders(params),
  });
}

export function useGuestList(eventId: string | undefined, status?: string) {
  return useQuery({
    queryKey: ['guest-list', eventId, status],
    queryFn: () => fetchGuestList(eventId!, status),
    enabled: !!eventId,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: (_, { event_id }) => {
      queryClient.invalidateQueries({ queryKey: ['ticket-orders'] });
      queryClient.invalidateQueries({ queryKey: ['ticket-types', event_id] });
      queryClient.invalidateQueries({ queryKey: ['guest-list', event_id] });
    },
  });
}

export function useCheckInTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, input }: { ticketId: string; input?: CheckInInput }) =>
      checkInTicket(ticketId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest-list'] });
    },
  });
}

// =============================================================================
// ORDER MANAGEMENT HOOKS
// =============================================================================

async function cancelOrder(orderId: string, reason?: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/ticket-orders/${orderId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to cancel order');
  }
  return res.json();
}

async function refundOrder(
  orderId: string,
  input: { amount?: number; reason?: string; refund_type?: 'full' | 'partial' }
): Promise<{ success: boolean; refund_amount: number }> {
  const res = await fetch(`/api/ticket-orders/${orderId}/refund`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to refund order');
  }
  return res.json();
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      cancelOrder(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-orders'] });
      queryClient.invalidateQueries({ queryKey: ['guest-list'] });
    },
  });
}

export function useRefundOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      amount,
      reason,
      refund_type,
    }: {
      orderId: string;
      amount?: number;
      reason?: string;
      refund_type?: 'full' | 'partial';
    }) => refundOrder(orderId, { amount, reason, refund_type }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-orders'] });
    },
  });
}

// =============================================================================
// TICKET TYPE MANAGEMENT HOOKS
// =============================================================================

interface CreateTicketTypeInput {
  event_id: string;
  name: string;
  description?: string;
  price: number;
  quantity_available?: number;
  sales_start?: string;
  sales_end?: string;
  min_per_order?: number;
  max_per_order?: number;
  visibility?: 'public' | 'hidden' | 'password' | 'invite_only';
  access_code?: string;
}

interface UpdateTicketTypeInput {
  name?: string;
  description?: string;
  price?: number;
  quantity_available?: number;
  sales_start?: string;
  sales_end?: string;
  min_per_order?: number;
  max_per_order?: number;
  visibility?: 'public' | 'hidden' | 'password' | 'invite_only';
  access_code?: string;
  is_active?: boolean;
}

async function createTicketType(input: CreateTicketTypeInput): Promise<{ ticket_type: TicketType }> {
  const res = await fetch(`/api/events/${input.event_id}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create ticket type');
  }
  return res.json();
}

async function updateTicketType(
  ticketTypeId: string,
  input: UpdateTicketTypeInput
): Promise<{ ticket_type: TicketType }> {
  const res = await fetch(`/api/ticket-types/${ticketTypeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update ticket type');
  }
  return res.json();
}

async function deleteTicketType(ticketTypeId: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/ticket-types/${ticketTypeId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete ticket type');
  }
  return res.json();
}

export function useCreateTicketType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTicketType,
    onSuccess: (_, { event_id }) => {
      queryClient.invalidateQueries({ queryKey: ['ticket-types', event_id] });
    },
  });
}

export function useUpdateTicketType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketTypeId, input }: { ticketTypeId: string; input: UpdateTicketTypeInput }) =>
      updateTicketType(ticketTypeId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-types'] });
    },
  });
}

export function useDeleteTicketType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTicketType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-types'] });
    },
  });
}
