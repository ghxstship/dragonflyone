import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ExpiringHold {
  id: string;
  space_id: string;
  space_name: string;
  contact_id: string;
  contact_name: string;
  contact_email: string;
  hold_type: 'tentative' | 'first_option' | 'second_option';
  start_date: string;
  end_date: string;
  expires_at: string;
  hours_until_expiry: number;
  notes?: string;
  booking_id?: string;
  created_at: string;
}

export interface HoldAction {
  hold_id: string;
  action: 'extend' | 'convert' | 'release';
  extension_hours?: number;
}

async function fetchExpiringHolds(hoursAhead: number = 48): Promise<{
  holds: ExpiringHold[];
  summary: {
    total: number;
    expiring_24h: number;
    expiring_48h: number;
    by_type: Record<string, number>;
  };
}> {
  const response = await fetch(`/api/availability/holds/expiring?hours=${hoursAhead}`);
  if (!response.ok) {
    throw new Error('Failed to fetch expiring holds');
  }
  return response.json();
}

async function extendHold(input: { holdId: string; extensionHours: number }): Promise<ExpiringHold> {
  const response = await fetch(`/api/availability/holds/${input.holdId}/extend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hours: input.extensionHours }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to extend hold');
  }
  return response.json();
}

async function convertHoldToBooking(holdId: string): Promise<{ booking_id: string; hold_released: boolean }> {
  const response = await fetch(`/api/availability/holds/${holdId}/convert`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to convert hold to booking');
  }
  return response.json();
}

async function releaseHold(holdId: string): Promise<void> {
  const response = await fetch(`/api/availability/holds/${holdId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to release hold');
  }
}

async function sendHoldReminder(holdId: string): Promise<{ sent: boolean; email: string }> {
  const response = await fetch(`/api/availability/holds/${holdId}/remind`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send reminder');
  }
  return response.json();
}

export function useExpiringHolds(hoursAhead: number = 48) {
  return useQuery({
    queryKey: ['expiring-holds', hoursAhead],
    queryFn: () => fetchExpiringHolds(hoursAhead),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useExtendHold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: extendHold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expiring-holds'] });
      queryClient.invalidateQueries({ queryKey: ['availability-holds'] });
    },
  });
}

export function useConvertHoldToBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: convertHoldToBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expiring-holds'] });
      queryClient.invalidateQueries({ queryKey: ['availability-holds'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useReleaseHold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: releaseHold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expiring-holds'] });
      queryClient.invalidateQueries({ queryKey: ['availability-holds'] });
    },
  });
}

export function useSendHoldReminder() {
  return useMutation({
    mutationFn: sendHoldReminder,
  });
}
