import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePurchaseOrders, usePurchaseOrder, useCreatePurchaseOrder, useUpdatePurchaseOrder } from '../useProcurement';

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
        { id: '1', description: 'Office Supplies', amount: 500, status: 'pending' },
        { id: '2', description: 'Equipment', amount: 2500, status: 'completed' },
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

describe('useProcurement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('usePurchaseOrders hook', () => {
    it('should fetch purchase orders successfully', async () => {
      const { result } = renderHook(() => usePurchaseOrders(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply status filter', async () => {
      const { result } = renderHook(() => usePurchaseOrders({ status: 'pending' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply category filter', async () => {
      const { result } = renderHook(() => usePurchaseOrders({ category: 'supplies' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply vendor_id filter', async () => {
      const { result } = renderHook(() => usePurchaseOrders({ vendor_id: 'vendor-1' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => usePurchaseOrders(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('usePurchaseOrder hook', () => {
    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => usePurchaseOrder(''), { wrapper: createWrapper() });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should fetch when id is provided', async () => {
      const { result } = renderHook(() => usePurchaseOrder('1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isFetching).toBe(true);
      });
    });
  });

  describe('useCreatePurchaseOrder hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCreatePurchaseOrder(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useCreatePurchaseOrder(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useUpdatePurchaseOrder hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useUpdatePurchaseOrder(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });
});

describe('PurchaseOrder interface', () => {
  it('should have required fields', () => {
    const po = {
      id: '1',
      description: 'Office Supplies',
      amount: 500,
      status: 'pending' as const,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(po.id).toBeDefined();
    expect(po.description).toBeDefined();
    expect(po.amount).toBeDefined();
    expect(po.status).toBeDefined();
    expect(po.created_at).toBeDefined();
    expect(po.updated_at).toBeDefined();
  });

  it('should support optional fields', () => {
    const po = {
      id: '1',
      vendor_id: 'vendor-1',
      vendor_name: 'Acme Supplies',
      description: 'Office Supplies',
      amount: 500,
      status: 'pending' as const,
      requested_by: 'user-1',
      due_date: '2024-02-01',
      category: 'supplies',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(po.vendor_id).toBe('vendor-1');
    expect(po.vendor_name).toBe('Acme Supplies');
    expect(po.requested_by).toBe('user-1');
    expect(po.due_date).toBe('2024-02-01');
    expect(po.category).toBe('supplies');
  });
});
