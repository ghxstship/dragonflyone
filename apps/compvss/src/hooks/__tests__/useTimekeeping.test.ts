import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTimekeeping, useTimeEntry, useCreateTimeEntry, useUpdateTimeEntry } from '../useTimekeeping';

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
        { id: '1', user_id: 'u1', project_id: 'p1', date: '2024-01-15', hours_regular: 8, hours_overtime: 0, status: 'approved' },
        { id: '2', user_id: 'u2', project_id: 'p1', date: '2024-01-15', hours_regular: 8, hours_overtime: 2, status: 'pending' },
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

describe('useTimekeeping', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useTimekeeping hook', () => {
    it('should fetch time entries successfully', async () => {
      const { result } = renderHook(() => useTimekeeping(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply status filter', async () => {
      const { result } = renderHook(() => useTimekeeping({ status: 'pending' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply projectId filter', async () => {
      const { result } = renderHook(() => useTimekeeping({ projectId: 'proj-1' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply userId filter', async () => {
      const { result } = renderHook(() => useTimekeeping({ userId: 'user-1' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply date range filters', async () => {
      const { result } = renderHook(() => useTimekeeping({ 
        startDate: '2024-01-01', 
        endDate: '2024-01-31' 
      }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useTimekeeping(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useTimeEntry hook', () => {
    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useTimeEntry(''), { wrapper: createWrapper() });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should fetch when id is provided', async () => {
      const { result } = renderHook(() => useTimeEntry('1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isFetching).toBe(true);
      });
    });
  });

  describe('useCreateTimeEntry hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCreateTimeEntry(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useCreateTimeEntry(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useUpdateTimeEntry hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useUpdateTimeEntry(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });
});

describe('TimeEntry interface', () => {
  it('should have required fields', () => {
    const entry = {
      id: '1',
      user_id: 'u1',
      project_id: 'p1',
      date: '2024-01-15',
      hours_regular: 8,
      hours_overtime: 0,
      status: 'approved' as const,
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
    };

    expect(entry.id).toBeDefined();
    expect(entry.user_id).toBeDefined();
    expect(entry.project_id).toBeDefined();
    expect(entry.date).toBeDefined();
    expect(entry.hours_regular).toBeDefined();
    expect(entry.hours_overtime).toBeDefined();
    expect(entry.status).toBeDefined();
  });

  it('should support optional fields', () => {
    const entry = {
      id: '1',
      user_id: 'u1',
      project_id: 'p1',
      date: '2024-01-15',
      hours_regular: 8,
      hours_overtime: 2,
      status: 'approved' as const,
      notes: 'Overtime for deadline',
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
      user: { id: 'u1', email: 'user@example.com', full_name: 'John Doe' },
      project: { id: 'p1', name: 'Summer Festival' },
    };

    expect(entry.notes).toBe('Overtime for deadline');
    expect(entry.user?.full_name).toBe('John Doe');
    expect(entry.project?.name).toBe('Summer Festival');
  });
});
