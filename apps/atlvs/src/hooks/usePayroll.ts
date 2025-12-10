'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { log } from '@ghxstship/config';

export interface PayrollEntry {
  id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  pay_period_start: string;
  pay_period_end: string;
  regular_hours: number;
  overtime_hours: number;
  gross_pay: number;
  deductions: number;
  net_pay: number;
  status: string;
  payment_date?: string;
}

export interface PayrollSummary {
  total_employees: number;
  total_gross: number;
  total_deductions: number;
  total_net: number;
  pending_count: number;
  processed_count: number;
}

export interface PayrollData {
  entries: PayrollEntry[];
  summary: PayrollSummary | null;
}

const DEMO_PAYROLL: PayrollData = {
  entries: [
    {
      id: '1',
      employee_id: 'emp1',
      employee_name: 'John Smith',
      department: 'Production',
      pay_period_start: '2025-01-01',
      pay_period_end: '2025-01-15',
      regular_hours: 80,
      overtime_hours: 8,
      gross_pay: 4500,
      deductions: 900,
      net_pay: 3600,
      status: 'paid',
      payment_date: '2025-01-20',
    },
  ],
  summary: {
    total_employees: 1,
    total_gross: 4500,
    total_deductions: 900,
    total_net: 3600,
    pending_count: 0,
    processed_count: 1,
  },
};

export const payrollKeys = {
  all: ['payroll'] as const,
  list: () => [...payrollKeys.all, 'list'] as const,
};

async function fetchPayroll(): Promise<PayrollData> {
  const response = await fetch('/api/payroll');
  if (response.status === 401) {
    return DEMO_PAYROLL;
  }
  if (!response.ok) {
    throw new Error('Failed to fetch payroll data');
  }
  const data = await response.json();
  return {
    entries: data.entries || [],
    summary: data.summary || null,
  };
}

async function createPayrollEntry(data: Record<string, unknown>): Promise<PayrollEntry> {
  const response = await fetch('/api/payroll', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create payroll entry');
  }
  return response.json();
}

async function processPayroll(period: string): Promise<void> {
  const response = await fetch('/api/payroll/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ period }),
  });
  if (!response.ok) {
    throw new Error('Failed to process payroll');
  }
}

export function usePayroll() {
  return useQuery({
    queryKey: payrollKeys.list(),
    queryFn: fetchPayroll,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePayrollEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPayrollEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
    },
    onError: (error) => {
      log.error('Failed to create payroll entry:', error);
    },
  });
}

export function useProcessPayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: processPayroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
    },
    onError: (error) => {
      log.error('Failed to process payroll:', error);
    },
  });
}

export function usePayrollData() {
  const payrollQuery = usePayroll();
  const createMutation = useCreatePayrollEntry();
  const processMutation = useProcessPayroll();

  return {
    entries: payrollQuery.data?.entries || [],
    summary: payrollQuery.data?.summary || null,
    isLoading: payrollQuery.isLoading,
    error: payrollQuery.error,
    createEntry: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    processPayroll: processMutation.mutateAsync,
    isProcessing: processMutation.isPending,
    refetch: payrollQuery.refetch,
  };
}
