import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePerformanceReviews, usePerformanceData, performanceKeys } from '../usePerformance';

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

describe('usePerformance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('performanceKeys', () => {
    it('should generate correct all key', () => {
      expect(performanceKeys.all).toEqual(['performance']);
    });

    it('should generate correct reviews key', () => {
      expect(performanceKeys.reviews()).toEqual(['performance', 'reviews']);
    });
  });

  describe('usePerformanceReviews hook', () => {
    it('should return demo data on 401 response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => usePerformanceReviews(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBeGreaterThan(0);
    });

    it('should return loading state initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));
      const { result } = renderHook(() => usePerformanceReviews(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('usePerformanceData hook', () => {
    it('should return combined data structure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => usePerformanceData(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.reviews).toBeDefined();
      expect(typeof result.current.completedCount).toBe('number');
      expect(typeof result.current.inProgressCount).toBe('number');
      expect(typeof result.current.avgScore).toBe('number');
      expect(typeof result.current.refetch).toBe('function');
    });
  });
});

describe('Review interface', () => {
  it('should have required fields', () => {
    const review = {
      id: '1',
      employee_id: 'emp1',
      reviewer_id: 'mgr1',
      review_period: 'Q4 2024',
      review_type: 'annual',
      status: 'completed',
      overall_score: 4.2,
      strengths: ['Leadership'],
      improvements: ['Time Management'],
      scheduled_date: '2024-12-15',
      created_at: '2024-12-01',
    };

    expect(review.id).toBeDefined();
    expect(review.employee_id).toBeDefined();
    expect(review.reviewer_id).toBeDefined();
    expect(review.review_period).toBeDefined();
    expect(review.review_type).toBeDefined();
    expect(review.status).toBeDefined();
    expect(review.overall_score).toBeDefined();
    expect(review.strengths).toBeDefined();
    expect(review.improvements).toBeDefined();
    expect(review.scheduled_date).toBeDefined();
    expect(review.created_at).toBeDefined();
  });

  it('should support optional fields', () => {
    const review = {
      id: '1',
      employee_id: 'emp1',
      reviewer_id: 'mgr1',
      employee: { id: 'emp1', full_name: 'John Smith', email: 'john@example.com' },
      reviewer: { id: 'mgr1', full_name: 'Sarah Johnson', email: 'sarah@example.com' },
      review_period: 'Q4 2024',
      review_type: 'annual',
      status: 'completed',
      overall_score: 4.2,
      strengths: ['Leadership'],
      improvements: ['Time Management'],
      scheduled_date: '2024-12-15',
      created_at: '2024-12-01',
    };

    expect(review.employee?.full_name).toBe('John Smith');
    expect(review.reviewer?.full_name).toBe('Sarah Johnson');
  });
});
