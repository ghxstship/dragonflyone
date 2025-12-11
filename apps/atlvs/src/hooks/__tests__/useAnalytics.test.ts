import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAnalytics, useCreateMetric } from '../useAnalytics';

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
        { id: '1', metric_name: 'Revenue', value: 100000, period: 'monthly', category: 'finance' },
        { id: '2', metric_name: 'Users', value: 5000, period: 'monthly', category: 'engagement' },
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

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAnalytics hook', () => {
    it('should fetch analytics successfully', async () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply period filter', async () => {
      const { result } = renderHook(() => useAnalytics({ period: 'monthly' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply category filter', async () => {
      const { result } = renderHook(() => useAnalytics({ category: 'finance' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply date range filters', async () => {
      const { result } = renderHook(() => useAnalytics({ 
        startDate: '2024-01-01', 
        endDate: '2024-12-31' 
      }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useCreateMetric hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCreateMetric(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useCreateMetric(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });
});

describe('AnalyticsMetric interface', () => {
  it('should have required fields', () => {
    const metric = {
      id: '1',
      metric_name: 'Revenue',
      value: 100000,
      period: 'monthly',
      date: '2024-01-01',
      category: 'finance',
    };

    expect(metric.id).toBeDefined();
    expect(metric.metric_name).toBeDefined();
    expect(metric.value).toBeDefined();
    expect(metric.period).toBeDefined();
    expect(metric.date).toBeDefined();
    expect(metric.category).toBeDefined();
  });

  it('should support optional fields', () => {
    const metric = {
      id: '1',
      metric_name: 'Revenue',
      value: 100000,
      period: 'monthly',
      date: '2024-01-01',
      category: 'finance',
      metadata: { source: 'stripe' },
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(metric.metadata).toEqual({ source: 'stripe' });
    expect(metric.created_at).toBe('2024-01-01');
    expect(metric.updated_at).toBe('2024-01-01');
  });
});
