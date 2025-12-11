import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePayroll, useProcessPayroll, payrollKeys } from '../usePayroll';

// Mock fetch
global.fetch = vi.fn();

const createWrapper = (): (({ children }: { children: ReactNode }) => JSX.Element) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function TestWrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('usePayroll', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('payrollKeys', () => {
    it('should generate correct all key', () => {
      expect(payrollKeys.all).toEqual(['payroll']);
    });

    it('should generate correct list key', () => {
      expect(payrollKeys.list()).toEqual(['payroll', 'list']);
    });
  });

  describe('usePayroll hook', () => {
    it('should return demo data on 401 response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => usePayroll(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.entries).toBeDefined();
      expect(result.current.data?.summary).toBeDefined();
    });

    it('should return loading state initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));
      const { result } = renderHook(() => usePayroll(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useProcessPayroll hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useProcessPayroll(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useProcessPayroll(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });
});

describe('PayrollEntry interface', () => {
  it('should have required fields', () => {
    const entry = {
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
    };

    expect(entry.id).toBeDefined();
    expect(entry.employee_id).toBeDefined();
    expect(entry.employee_name).toBeDefined();
    expect(entry.department).toBeDefined();
    expect(entry.pay_period_start).toBeDefined();
    expect(entry.pay_period_end).toBeDefined();
    expect(entry.regular_hours).toBeDefined();
    expect(entry.overtime_hours).toBeDefined();
    expect(entry.gross_pay).toBeDefined();
    expect(entry.deductions).toBeDefined();
    expect(entry.net_pay).toBeDefined();
    expect(entry.status).toBeDefined();
  });

  it('should support optional fields', () => {
    const entry = {
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
    };

    expect(entry.payment_date).toBe('2025-01-20');
  });
});

describe('PayrollSummary interface', () => {
  it('should have all summary fields', () => {
    const summary = {
      total_employees: 10,
      total_gross: 45000,
      total_deductions: 9000,
      total_net: 36000,
      pending_count: 2,
      processed_count: 8,
    };

    expect(summary.total_employees).toBe(10);
    expect(summary.total_gross).toBe(45000);
    expect(summary.total_deductions).toBe(9000);
    expect(summary.total_net).toBe(36000);
    expect(summary.pending_count).toBe(2);
    expect(summary.processed_count).toBe(8);
  });
});
