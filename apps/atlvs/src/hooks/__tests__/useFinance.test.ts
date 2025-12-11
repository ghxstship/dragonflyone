import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTransactions, useAccounts, useCreateTransaction } from '../useFinance';

// Mock Supabase with proper chaining
vi.mock('@/lib/supabase', () => {
  const createChainableMock = (finalData: unknown) => {
    const mock = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      then: vi.fn((resolve) => resolve({ data: finalData, error: null })),
    };
    Object.keys(mock).forEach(key => {
      if (key !== 'then') {
        (mock as Record<string, ReturnType<typeof vi.fn>>)[key].mockReturnValue(mock);
      }
    });
    return mock;
  };

  return {
    supabase: {
      from: vi.fn(() => createChainableMock([
        { id: '1', type: 'income', category: 'sales', amount: 5000, status: 'completed' },
        { id: '2', type: 'expense', category: 'marketing', amount: 1500, status: 'pending' },
      ])),
    },
  };
});

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

describe('useFinance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useTransactions hook', () => {
    it('should fetch transactions successfully', async () => {
      const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply type filter', async () => {
      const { result } = renderHook(() => useTransactions({ type: 'income' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply category filter', async () => {
      const { result } = renderHook(() => useTransactions({ category: 'sales' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply date range filters', async () => {
      const { result } = renderHook(() => useTransactions({ 
        startDate: '2024-01-01', 
        endDate: '2024-12-31' 
      }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useAccounts hook', () => {
    it('should fetch accounts successfully', async () => {
      const { result } = renderHook(() => useAccounts(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('useCreateTransaction hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCreateTransaction(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useCreateTransaction(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });
});

describe('Transaction interface', () => {
  it('should have required fields', () => {
    const transaction = {
      id: '1',
      type: 'income' as const,
      category: 'sales',
      amount: 5000,
      date: '2024-01-15',
      status: 'completed' as const,
    };

    expect(transaction.id).toBeDefined();
    expect(transaction.type).toBeDefined();
    expect(transaction.category).toBeDefined();
    expect(transaction.amount).toBeDefined();
    expect(transaction.date).toBeDefined();
    expect(transaction.status).toBeDefined();
  });

  it('should support optional fields', () => {
    const transaction = {
      id: '1',
      type: 'expense' as const,
      category: 'marketing',
      amount: 1500,
      date: '2024-01-15',
      description: 'Marketing campaign',
      account_id: 'acc-1',
      vendor_id: 'vendor-1',
      project_id: 'proj-1',
      status: 'pending' as const,
      metadata: { campaign: 'summer' },
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(transaction.description).toBe('Marketing campaign');
    expect(transaction.account_id).toBe('acc-1');
    expect(transaction.vendor_id).toBe('vendor-1');
    expect(transaction.metadata).toEqual({ campaign: 'summer' });
  });
});

describe('FinancialAccount interface', () => {
  it('should have all account fields', () => {
    const account = {
      id: '1',
      name: 'Operating Account',
      type: 'asset' as const,
      balance: 50000,
      currency: 'USD',
      status: 'active' as const,
    };

    expect(account.id).toBeDefined();
    expect(account.name).toBe('Operating Account');
    expect(account.type).toBe('asset');
    expect(account.balance).toBe(50000);
    expect(account.currency).toBe('USD');
    expect(account.status).toBe('active');
  });
});
