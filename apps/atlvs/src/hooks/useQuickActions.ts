import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface QuickActionResult {
  success: boolean;
  action: string;
  entity_type: string;
  entity_id: string;
  message: string;
  data?: Record<string, unknown>;
}

async function quickCreateBooking(input: {
  contactId: string;
  spaceId: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  eventType: string;
  guestCount: number;
  notes?: string;
}): Promise<QuickActionResult> {
  const response = await fetch('/api/quick-actions/booking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create booking');
  }
  return response.json();
}

async function quickCreateInvoice(input: {
  bookingId: string;
  includeDeposit?: boolean;
  dueDate?: string;
}): Promise<QuickActionResult> {
  const response = await fetch('/api/quick-actions/invoice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create invoice');
  }
  return response.json();
}

async function quickSendProposal(input: {
  bookingId: string;
  templateId?: string;
  recipientEmail: string;
  message?: string;
}): Promise<QuickActionResult> {
  const response = await fetch('/api/quick-actions/proposal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send proposal');
  }
  return response.json();
}

async function quickConvertLead(input: {
  leadId: string;
  createBooking?: boolean;
  spaceId?: string;
}): Promise<QuickActionResult> {
  const response = await fetch('/api/quick-actions/convert-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to convert lead');
  }
  return response.json();
}

async function quickLogActivity(input: {
  entityType: 'contact' | 'booking' | 'lead';
  entityId: string;
  activityType: 'call' | 'email' | 'meeting' | 'note';
  description: string;
  createFollowUp?: boolean;
  followUpDate?: string;
}): Promise<QuickActionResult> {
  const response = await fetch('/api/quick-actions/activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to log activity');
  }
  return response.json();
}

async function quickScheduleFollowUp(input: {
  entityType: 'contact' | 'booking' | 'lead';
  entityId: string;
  taskType: 'call' | 'email' | 'meeting';
  dueDate: string;
  dueTime?: string;
  notes?: string;
}): Promise<QuickActionResult> {
  const response = await fetch('/api/quick-actions/follow-up', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to schedule follow-up');
  }
  return response.json();
}

export function useQuickCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: quickCreateBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}

export function useQuickCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: quickCreateInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useQuickSendProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: quickSendProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
}

export function useQuickConvertLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: quickConvertLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useQuickLogActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: quickLogActivity,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activity-log'] });
      queryClient.invalidateQueries({ queryKey: [data.entity_type, data.entity_id] });
    },
  });
}

export function useQuickScheduleFollowUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: quickScheduleFollowUp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
