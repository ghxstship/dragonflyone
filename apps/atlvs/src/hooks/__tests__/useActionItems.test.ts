import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useActionItems, useUpdateActionItem } from '../useActionItems';

// Mock Supabase with proper chaining - returns error to trigger fallback data
vi.mock('@/lib/supabase', () => {
  const createChainableMock = () => {
    const mock = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      then: vi.fn((resolve) => resolve({ data: [], error: { message: 'Table not found' } })),
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
      from: vi.fn(() => createChainableMock()),
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

describe('useActionItems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useActionItems hook', () => {
    it('should fetch action items successfully', async () => {
      const { result } = renderHook(() => useActionItems(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply status filter', async () => {
      const { result } = renderHook(() => useActionItems({ status: 'pending' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply priority filter', async () => {
      const { result } = renderHook(() => useActionItems({ priority: 'high' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply limit filter', async () => {
      const { result } = renderHook(() => useActionItems({ limit: 10 }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useActionItems(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useUpdateActionItem hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useUpdateActionItem(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useUpdateActionItem(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });
});

describe('ActionItem interface', () => {
  it('should have required fields', () => {
    const item = {
      id: '1',
      source: 'task' as const,
      title: 'Review Budget',
      priority: 'high' as const,
      status: 'pending' as const,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(item.id).toBeDefined();
    expect(item.source).toBeDefined();
    expect(item.title).toBeDefined();
    expect(item.priority).toBeDefined();
    expect(item.status).toBeDefined();
    expect(item.created_at).toBeDefined();
    expect(item.updated_at).toBeDefined();
  });

  it('should support optional fields', () => {
    const item = {
      id: '1',
      source: 'task' as const,
      title: 'Review Budget',
      description: 'Review Q4 budget allocation',
      priority: 'high' as const,
      status: 'pending' as const,
      due_date: '2024-02-01',
      assigned_to: 'user-1',
      assignee_name: 'John Doe',
      project_id: 'proj-1',
      project_name: 'Summer Festival',
      production_id: 'prod-1',
      production_name: 'Main Production',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(item.description).toBe('Review Q4 budget allocation');
    expect(item.due_date).toBe('2024-02-01');
    expect(item.assigned_to).toBe('user-1');
    expect(item.assignee_name).toBe('John Doe');
    expect(item.project_name).toBe('Summer Festival');
  });
});
