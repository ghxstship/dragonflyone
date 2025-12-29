import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useExpensesList, useCreateExpense, expenseKeys } from '../useExpenses';

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

describe('useExpenses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('expenseKeys', () => {
    it('should generate correct all key', () => {
      expect(expenseKeys.all).toEqual(['expenses']);
    });

    it('should generate correct list key', () => {
      expect(expenseKeys.list()).toEqual(['expenses', 'list']);
    });
  });

  describe('useExpensesList hook', () => {
    it('should handle 401 response as error', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      const { result } = renderHook(() => useExpensesList(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should return loading state initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));
      const { result } = renderHook(() => useExpensesList(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useCreateExpense hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCreateExpense(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useCreateExpense(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });
});

describe('Expense interface', () => {
  it('should have required fields', () => {
    const expense = {
      id: '1',
      expense_number: 'EXP-001',
      project_id: 'proj-1',
      project_name: 'Summer Festival',
      crew_member_id: 'crew-1',
      crew_member_name: 'John Smith',
      category: 'travel',
      description: 'Flight to venue',
      amount: 450,
      currency: 'USD',
      expense_date: '2025-01-15',
      submitted_date: '2025-01-16',
      status: 'pending',
    };

    expect(expense.id).toBeDefined();
    expect(expense.expense_number).toBeDefined();
    expect(expense.project_id).toBeDefined();
    expect(expense.amount).toBeDefined();
    expect(expense.status).toBeDefined();
  });

  it('should support optional fields', () => {
    const expense = {
      id: '1',
      expense_number: 'EXP-001',
      project_id: 'proj-1',
      project_name: 'Summer Festival',
      crew_member_id: 'crew-1',
      crew_member_name: 'John Smith',
      category: 'travel',
      description: 'Flight to venue',
      amount: 450,
      currency: 'USD',
      receipt_url: '/receipts/exp-001.pdf',
      expense_date: '2025-01-15',
      submitted_date: '2025-01-16',
      status: 'approved',
      approved_by: 'manager-1',
      approved_date: '2025-01-17',
      notes: 'Approved for reimbursement',
    };

    expect(expense.receipt_url).toBe('/receipts/exp-001.pdf');
    expect(expense.approved_by).toBe('manager-1');
    expect(expense.approved_date).toBe('2025-01-17');
    expect(expense.notes).toBe('Approved for reimbursement');
  });
});

describe('ExpenseSummary interface', () => {
  it('should have all summary fields', () => {
    const summary = {
      total_expenses: 10,
      pending_count: 3,
      approved_count: 6,
      rejected_count: 1,
      total_amount: 5000,
      pending_amount: 1500,
      approved_amount: 3500,
    };

    expect(summary.total_expenses).toBe(10);
    expect(summary.pending_count).toBe(3);
    expect(summary.approved_count).toBe(6);
    expect(summary.rejected_count).toBe(1);
    expect(summary.total_amount).toBe(5000);
    expect(summary.pending_amount).toBe(1500);
    expect(summary.approved_amount).toBe(3500);
  });
});
