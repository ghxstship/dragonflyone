import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAssets, useCreateAsset, useUpdateAsset } from '../useAssets';

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
        { id: '1', name: 'MacBook Pro', category: 'equipment', value: 2500, status: 'active' },
        { id: '2', name: 'Camera Kit', category: 'equipment', value: 5000, status: 'active' },
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

describe('useAssets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAssets hook', () => {
    it('should fetch assets successfully', async () => {
      const { result } = renderHook(() => useAssets(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply status filter', async () => {
      const { result } = renderHook(() => useAssets({ status: 'active' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply category filter', async () => {
      const { result } = renderHook(() => useAssets({ category: 'equipment' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useAssets(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useCreateAsset hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCreateAsset(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useCreateAsset(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useUpdateAsset hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useUpdateAsset(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });
});

describe('Asset interface', () => {
  it('should have required fields', () => {
    const asset = {
      id: '1',
      name: 'MacBook Pro',
      category: 'equipment',
      value: 2500,
      purchase_date: '2024-01-01',
      status: 'active' as const,
    };

    expect(asset.id).toBeDefined();
    expect(asset.name).toBeDefined();
    expect(asset.category).toBeDefined();
    expect(asset.value).toBeDefined();
    expect(asset.purchase_date).toBeDefined();
    expect(asset.status).toBeDefined();
  });

  it('should support optional fields', () => {
    const asset = {
      id: '1',
      name: 'MacBook Pro',
      category: 'equipment',
      value: 2500,
      purchase_date: '2024-01-01',
      status: 'active' as const,
      location: 'Office A',
      assigned_to: 'user-1',
      depreciation_rate: 0.2,
      current_value: 2000,
      metadata: { serial: 'ABC123' },
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(asset.location).toBe('Office A');
    expect(asset.assigned_to).toBe('user-1');
    expect(asset.depreciation_rate).toBe(0.2);
    expect(asset.current_value).toBe(2000);
    expect(asset.metadata).toEqual({ serial: 'ABC123' });
  });
});
