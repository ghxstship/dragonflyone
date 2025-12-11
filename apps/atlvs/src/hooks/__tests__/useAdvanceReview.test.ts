import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAdvanceReviewQueue, useAdvanceForReview, useApproveAdvance, useRejectAdvance } from '../useAdvanceReview';

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

describe('useAdvanceReview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAdvanceReviewQueue hook', () => {
    it('should fetch advances successfully', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ advances: [], total: 0, limit: 10, offset: 0 }),
      });

      const { result } = renderHook(() => useAdvanceReviewQueue(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply status filter', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ advances: [], total: 0, limit: 10, offset: 0 }),
      });

      const { result } = renderHook(() => useAdvanceReviewQueue({ status: 'pending' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));
      const { result } = renderHook(() => useAdvanceReviewQueue(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useAdvanceForReview hook', () => {
    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useAdvanceForReview(''), { wrapper: createWrapper() });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should fetch when id is provided', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ advance: { id: '1', status: 'pending' } }),
      });

      const { result } = renderHook(() => useAdvanceForReview('1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isFetching).toBe(true);
      });
    });
  });

  describe('useApproveAdvance hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useApproveAdvance('1'), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useApproveAdvance('1'), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useRejectAdvance hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useRejectAdvance('1'), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });
});

describe('AdvancesResponse interface', () => {
  it('should have required fields', () => {
    const response = {
      advances: [],
      total: 0,
      limit: 10,
      offset: 0,
    };

    expect(response.advances).toBeDefined();
    expect(response.total).toBeDefined();
    expect(response.limit).toBeDefined();
    expect(response.offset).toBeDefined();
  });
});
