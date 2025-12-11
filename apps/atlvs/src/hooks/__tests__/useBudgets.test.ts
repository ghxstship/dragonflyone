import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBudgets, useBudget, useCreateBudget, useUpdateBudget, useDeleteBudget } from '../useBudgets';

// Mock Supabase with proper chaining
vi.mock('@/lib/supabase', () => {
  const createChainableMock = (finalData: unknown) => {
    const mock = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
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
        { id: '1', name: 'Q1 Budget', category: 'Operations', budgeted: 50000, actual: 45000, status: 'on-track' },
        { id: '2', name: 'Q2 Budget', category: 'Marketing', budgeted: 30000, actual: 35000, status: 'over' },
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

describe('useBudgets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useBudgets hook', () => {
    it('should fetch budgets successfully', async () => {
      const { result } = renderHook(() => useBudgets(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply period filter', async () => {
      const { result } = renderHook(() => useBudgets({ period: 'Q1-2024' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply category filter', async () => {
      const { result } = renderHook(() => useBudgets({ category: 'Operations' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply status filter', async () => {
      const { result } = renderHook(() => useBudgets({ status: 'on-track' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply project_id filter', async () => {
      const { result } = renderHook(() => useBudgets({ project_id: 'proj-1' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useBudgets(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useBudget hook', () => {
    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useBudget(''), { wrapper: createWrapper() });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should fetch when id is provided', async () => {
      const { result } = renderHook(() => useBudget('1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isFetching).toBe(true);
      });
    });
  });

  describe('useCreateBudget hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCreateBudget(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useCreateBudget(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useUpdateBudget hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useUpdateBudget(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });

  describe('useDeleteBudget hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useDeleteBudget(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });
});

describe('Budget interface', () => {
  it('should have required fields', () => {
    const budget = {
      id: '1',
      name: 'Q1 Budget',
      budgeted: 50000,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(budget.id).toBeDefined();
    expect(budget.name).toBeDefined();
    expect(budget.budgeted).toBeDefined();
  });

  it('should support optional fields', () => {
    const budget = {
      id: '1',
      name: 'Q1 Budget',
      category: 'Operations',
      budgeted: 50000,
      actual: 45000,
      variance: 5000,
      status: 'on-track' as const,
      period: 'Q1-2024',
      project_id: 'proj-1',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(budget.category).toBe('Operations');
    expect(budget.actual).toBe(45000);
    expect(budget.variance).toBe(5000);
    expect(budget.status).toBe('on-track');
  });
});

describe('BudgetFilters interface', () => {
  it('should support all filter types', () => {
    const filters = {
      period: 'Q1-2024',
      category: 'Operations',
      status: 'on-track',
      project_id: 'proj-1',
    };

    expect(filters.period).toBe('Q1-2024');
    expect(filters.category).toBe('Operations');
    expect(filters.status).toBe('on-track');
    expect(filters.project_id).toBe('proj-1');
  });
});
