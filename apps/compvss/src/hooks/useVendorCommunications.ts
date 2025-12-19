import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface VendorCommunication {
  id: string;
  vendor_id: string;
  vendor_name: string;
  booking_id?: string;
  event_name?: string;
  channel: 'email' | 'sms' | 'portal' | 'phone' | 'in_person';
  direction: 'inbound' | 'outbound';
  subject?: string;
  message: string;
  attachments: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'failed';
  sent_at?: string;
  read_at?: string;
  sender_id: string;
  sender_name: string;
  created_at: string;
}

export interface CommunicationThread {
  vendor_id: string;
  vendor_name: string;
  booking_id?: string;
  event_name?: string;
  messages: VendorCommunication[];
  unread_count: number;
  last_message_at: string;
}

export interface SendMessageInput {
  vendor_id: string;
  booking_id?: string;
  channel: VendorCommunication['channel'];
  subject?: string;
  message: string;
  attachments?: Array<{ name: string; url: string; type: string }>;
}

async function fetchVendorCommunications(vendorId: string): Promise<{
  communications: VendorCommunication[];
  total: number;
}> {
  const response = await fetch(`/api/vendor-communications?vendor_id=${vendorId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch vendor communications');
  }
  return response.json();
}

async function fetchBookingCommunications(bookingId: string): Promise<{
  threads: CommunicationThread[];
  total_unread: number;
}> {
  const response = await fetch(`/api/vendor-communications/${bookingId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch booking communications');
  }
  return response.json();
}

async function sendMessage(input: SendMessageInput): Promise<VendorCommunication> {
  const response = await fetch('/api/vendor-communications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send message');
  }
  return response.json();
}

async function markAsRead(communicationId: string): Promise<VendorCommunication> {
  const response = await fetch(`/api/vendor-communications/${communicationId}/read`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to mark as read');
  }
  return response.json();
}

async function sendBulkMessage(input: {
  vendor_ids: string[];
  booking_id?: string;
  channel: VendorCommunication['channel'];
  subject?: string;
  message: string;
}): Promise<{ sent: number; failed: number }> {
  const response = await fetch('/api/vendor-communications/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send bulk message');
  }
  return response.json();
}

export function useVendorCommunications(vendorId: string) {
  return useQuery({
    queryKey: ['vendor-communications', vendorId],
    queryFn: () => fetchVendorCommunications(vendorId),
    enabled: !!vendorId,
  });
}

export function useBookingCommunications(bookingId: string) {
  return useQuery({
    queryKey: ['booking-communications', bookingId],
    queryFn: () => fetchBookingCommunications(bookingId),
    enabled: !!bookingId,
  });
}

export function useSendVendorMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-communications', data.vendor_id] });
      if (data.booking_id) {
        queryClient.invalidateQueries({ queryKey: ['booking-communications', data.booking_id] });
      }
    },
  });
}

export function useMarkCommunicationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-communications'] });
      queryClient.invalidateQueries({ queryKey: ['booking-communications'] });
    },
  });
}

export function useSendBulkMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendBulkMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-communications'] });
      queryClient.invalidateQueries({ queryKey: ['booking-communications'] });
    },
  });
}
