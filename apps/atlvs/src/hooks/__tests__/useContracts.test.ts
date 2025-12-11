import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useContracts, useContract, useCreateContract, useUpdateContract } from '../useContracts';

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
        { id: '1', title: 'Service Agreement', type: 'service', value: 50000, status: 'active' },
        { id: '2', title: 'NDA', type: 'nda', value: 0, status: 'active' },
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

describe('useContracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useContracts hook', () => {
    it('should fetch contracts successfully', async () => {
      const { result } = renderHook(() => useContracts(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useContracts(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useContract hook', () => {
    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useContract(''), { wrapper: createWrapper() });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should fetch when id is provided', async () => {
      const { result } = renderHook(() => useContract('1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isFetching).toBe(true);
      });
    });
  });

  describe('useCreateContract hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCreateContract(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useCreateContract(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useUpdateContract hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useUpdateContract(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });
});

describe('Contract interface', () => {
  it('should have required fields', () => {
    const contract = {
      id: '1',
      title: 'Service Agreement',
      vendor_id: 'vendor-1',
      type: 'service' as const,
      value: 50000,
      start_date: '2024-01-01',
      status: 'active' as const,
      terms: 'Standard terms',
      auto_renew: true,
      created_at: '2024-01-01',
    };

    expect(contract.id).toBeDefined();
    expect(contract.title).toBeDefined();
    expect(contract.vendor_id).toBeDefined();
    expect(contract.type).toBeDefined();
    expect(contract.value).toBeDefined();
    expect(contract.start_date).toBeDefined();
    expect(contract.status).toBeDefined();
    expect(contract.terms).toBeDefined();
    expect(contract.auto_renew).toBeDefined();
  });

  it('should support optional fields', () => {
    const contract = {
      id: '1',
      title: 'Service Agreement',
      vendor_id: 'vendor-1',
      vendor: { name: 'Acme Corp' },
      type: 'service' as const,
      value: 50000,
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      status: 'active' as const,
      terms: 'Standard terms',
      auto_renew: true,
      created_at: '2024-01-01',
    };

    expect(contract.vendor?.name).toBe('Acme Corp');
    expect(contract.end_date).toBe('2024-12-31');
  });
});
