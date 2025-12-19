import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface TicketScanResult {
  valid: boolean;
  ticket_id: string;
  ticket_code: string;
  order_id: string;
  event_id: string;
  event_name: string;
  ticket_type: string;
  attendee_name: string;
  attendee_email: string;
  status: 'valid' | 'already_checked_in' | 'invalid' | 'cancelled' | 'expired';
  checked_in_at?: string;
  checked_in_by?: string;
  notes?: string;
  gate?: string;
  seat_info?: {
    section: string;
    row: string;
    seat: string;
  };
}

export interface CheckInInput {
  ticket_code: string;
  event_id: string;
  gate?: string;
  notes?: string;
}

export interface BulkCheckInInput {
  ticket_codes: string[];
  event_id: string;
  gate?: string;
}

async function scanTicket(ticketCode: string): Promise<TicketScanResult> {
  const response = await fetch(`/api/tickets/scan/${ticketCode}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to scan ticket');
  }
  return response.json();
}

async function checkInTicket(input: CheckInInput): Promise<TicketScanResult> {
  const response = await fetch('/api/tickets/check-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to check in ticket');
  }
  return response.json();
}

async function undoCheckIn(ticketId: string): Promise<TicketScanResult> {
  const response = await fetch(`/api/tickets/${ticketId}/undo-check-in`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to undo check-in');
  }
  return response.json();
}

async function bulkCheckIn(input: BulkCheckInInput): Promise<{
  success: number;
  failed: number;
  results: TicketScanResult[];
}> {
  const response = await fetch('/api/tickets/bulk-check-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to bulk check-in');
  }
  return response.json();
}

async function getCheckInStats(eventId: string): Promise<{
  total_tickets: number;
  checked_in: number;
  not_checked_in: number;
  check_in_rate: number;
  by_ticket_type: Array<{
    ticket_type: string;
    total: number;
    checked_in: number;
  }>;
  by_gate: Array<{
    gate: string;
    checked_in: number;
  }>;
  check_ins_by_hour: Array<{
    hour: string;
    count: number;
  }>;
}> {
  const response = await fetch(`/api/events/${eventId}/check-in-stats`);
  if (!response.ok) {
    throw new Error('Failed to fetch check-in stats');
  }
  return response.json();
}

export function useScanTicket() {
  return useMutation({
    mutationFn: scanTicket,
  });
}

export function useCheckInTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkInTicket,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event-check-ins', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['check-in-stats', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['guest-list', data.event_id] });
    },
  });
}

export function useUndoCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: undoCheckIn,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event-check-ins', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['check-in-stats', data.event_id] });
    },
  });
}

export function useBulkCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkCheckIn,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event-check-ins', variables.event_id] });
      queryClient.invalidateQueries({ queryKey: ['check-in-stats', variables.event_id] });
      queryClient.invalidateQueries({ queryKey: ['guest-list', variables.event_id] });
    },
  });
}

export function useCheckInStats(eventId: string) {
  const queryClient = useQueryClient();
  
  return {
    refetch: () => queryClient.fetchQuery({
      queryKey: ['check-in-stats', eventId],
      queryFn: () => getCheckInStats(eventId),
    }),
  };
}
