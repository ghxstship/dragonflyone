'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface PaymentMilestone {
  id: string;
  schedule_id: string;
  milestone_name: string;
  due_date: string;
  amount: number;
  percentage?: number;
  description?: string;
  status: 'pending' | 'paid' | 'overdue' | 'waived';
  paid_amount: number;
  paid_at?: string;
  payment_id?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentSchedule {
  id: string;
  organization_id: string;
  booking_id?: string;
  invoice_id?: string;
  name?: string;
  total_amount: number;
  amount_paid: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  deposit_percentage: number;
  late_fee_percentage: number;
  late_fee_grace_days: number;
  auto_reminder: boolean;
  created_at: string;
  updated_at: string;
  booking?: {
    id: string;
    booking_number: string;
    event_name?: string;
    event_date: string;
    total_amount: number;
    contact?: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    };
  };
  invoice?: {
    id: string;
    invoice_number: string;
    total: number;
    balance_due: number;
  };
  milestones?: PaymentMilestone[];
}

export interface CreatePaymentScheduleInput {
  organization_id: string;
  booking_id?: string;
  invoice_id?: string;
  name?: string;
  total_amount?: number;
  deposit_percentage?: number;
  late_fee_percentage?: number;
  late_fee_grace_days?: number;
  auto_reminder?: boolean;
  milestones?: {
    milestone_name: string;
    due_date: string;
    amount: number;
    percentage?: number;
    description?: string;
  }[];
}

export interface UpdatePaymentScheduleInput {
  name?: string;
  deposit_percentage?: number;
  late_fee_percentage?: number;
  late_fee_grace_days?: number;
  auto_reminder?: boolean;
}

export interface SendReminderInput {
  milestone_id?: string;
  recipient_email: string;
  channel?: 'email' | 'sms';
  custom_message?: string;
}

export interface UpcomingPaymentsResponse {
  milestones: (PaymentMilestone & { schedule: PaymentSchedule })[];
  grouped: Record<string, (PaymentMilestone & { schedule: PaymentSchedule })[]>;
  summary: {
    total_milestones: number;
    total_amount_due: number;
    overdue: number;
    due_this_week: number;
  };
}

const fetchPaymentSchedules = async (
  organizationId?: string,
  bookingId?: string,
  invoiceId?: string
): Promise<PaymentSchedule[]> => {
  const params = new URLSearchParams();
  if (organizationId) params.set('organization_id', organizationId);
  if (bookingId) params.set('booking_id', bookingId);
  if (invoiceId) params.set('invoice_id', invoiceId);

  const response = await fetch(`/api/payment-schedules?${params}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch payment schedules');
  }
  const data = await response.json();
  return data.schedules;
};

const fetchPaymentSchedule = async (id: string): Promise<PaymentSchedule> => {
  const response = await fetch(`/api/payment-schedules/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch payment schedule');
  }
  const data = await response.json();
  return data.schedule;
};

const fetchUpcomingPayments = async (
  organizationId?: string,
  days?: number
): Promise<UpcomingPaymentsResponse> => {
  const params = new URLSearchParams();
  if (organizationId) params.set('organization_id', organizationId);
  if (days) params.set('days', String(days));

  const response = await fetch(`/api/payment-schedules/upcoming?${params}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch upcoming payments');
  }
  return response.json();
};

const createPaymentSchedule = async (input: CreatePaymentScheduleInput): Promise<PaymentSchedule> => {
  const response = await fetch('/api/payment-schedules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create payment schedule');
  }
  const data = await response.json();
  return data.schedule;
};

const updatePaymentSchedule = async (
  { id, ...input }: UpdatePaymentScheduleInput & { id: string }
): Promise<PaymentSchedule> => {
  const response = await fetch(`/api/payment-schedules/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update payment schedule');
  }
  const data = await response.json();
  return data.schedule;
};

const deletePaymentSchedule = async (id: string): Promise<void> => {
  const response = await fetch(`/api/payment-schedules/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete payment schedule');
  }
};

const sendReminder = async ({ id, ...input }: SendReminderInput & { id: string }): Promise<void> => {
  const response = await fetch(`/api/payment-schedules/${id}/reminder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send reminder');
  }
};

export function usePaymentSchedules(
  organizationId?: string,
  bookingId?: string,
  invoiceId?: string
) {
  return useQuery({
    queryKey: ['payment-schedules', organizationId, bookingId, invoiceId],
    queryFn: () => fetchPaymentSchedules(organizationId, bookingId, invoiceId),
    staleTime: 2 * 60 * 1000,
  });
}

export function usePaymentSchedule(id: string) {
  return useQuery({
    queryKey: ['payment-schedule', id],
    queryFn: () => fetchPaymentSchedule(id),
    enabled: !!id,
  });
}

export function useUpcomingPayments(organizationId?: string, days?: number) {
  return useQuery({
    queryKey: ['upcoming-payments', organizationId, days],
    queryFn: () => fetchUpcomingPayments(organizationId, days),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePaymentSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPaymentSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-payments'] });
    },
  });
}

export function useUpdatePaymentSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePaymentSchedule,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment-schedules'] });
      queryClient.setQueryData(['payment-schedule', data.id], data);
    },
  });
}

export function useDeletePaymentSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePaymentSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-payments'] });
    },
  });
}

export function useSendPaymentReminder() {
  return useMutation({
    mutationFn: sendReminder,
  });
}
