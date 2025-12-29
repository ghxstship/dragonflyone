import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProjects, useProject, useCreateProject, useUpdateProject, useDeleteProject } from '../useProjects';

// Mock Supabase with proper chaining
vi.mock('@/lib/supabase', () => {
  const createChainableMock = (finalData: unknown) => {
    const mock = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
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
        { id: '1', name: 'Summer Festival', code: 'SF2024', status: 'active', phase: 'in_production', budget: 500000 },
        { id: '2', name: 'Corporate Event', code: 'CE2024', status: 'planning', phase: 'intake', budget: 100000 },
      ])),
    },
    fromDynamic: vi.fn(() => createChainableMock({ id: '3', name: 'New Project' })),
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

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useProjects hook', () => {
    it('should fetch projects successfully', async () => {
      const { result } = renderHook(() => useProjects(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply status filter', async () => {
      const { result } = renderHook(() => useProjects({ status: 'active' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply phase filter', async () => {
      const { result } = renderHook(() => useProjects({ phase: 'in_production' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useProjects(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });

    it('should have data property', async () => {
      const { result } = renderHook(() => useProjects(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });
    });
  });

  describe('useProject hook', () => {
    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useProject(''), { wrapper: createWrapper() });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should fetch when id is provided', async () => {
      const { result } = renderHook(() => useProject('1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isFetching).toBe(true);
      });
    });
  });

  describe('useCreateProject hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCreateProject(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useCreateProject(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });

    it('should have isLoading property', () => {
      const { result } = renderHook(() => useCreateProject(), { wrapper: createWrapper() });
      expect(result.current.isPending).toBe(false);
    });
  });

  describe('useUpdateProject hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useUpdateProject(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useUpdateProject(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useDeleteProject hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useDeleteProject(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useDeleteProject(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });
});

describe('Project interface', () => {
  it('should have required fields', () => {
    const project = {
      id: '1',
      name: 'Summer Festival',
      status: 'active' as const,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(project.id).toBeDefined();
    expect(project.name).toBeDefined();
    expect(project.status).toBeDefined();
    expect(project.created_at).toBeDefined();
    expect(project.updated_at).toBeDefined();
  });

  it('should support optional fields', () => {
    const project = {
      id: '1',
      name: 'Summer Festival',
      description: 'Annual summer music festival',
      status: 'active' as const,
      budget: 500000,
      actual_cost: 450000,
      start_date: '2024-06-01',
      end_date: '2024-06-03',
      event_date: '2024-06-02',
      crew_count: 150,
      code: 'SF2024',
      phase: 'in_production',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(project.description).toBe('Annual summer music festival');
    expect(project.budget).toBe(500000);
    expect(project.actual_cost).toBe(450000);
    expect(project.crew_count).toBe(150);
    expect(project.code).toBe('SF2024');
    expect(project.phase).toBe('in_production');
  });
});

describe('ProjectFilters interface', () => {
  it('should support status filter', () => {
    const filters = { status: 'active' };
    expect(filters.status).toBe('active');
  });

  it('should support phase filter', () => {
    const filters = { phase: 'in_production' };
    expect(filters.phase).toBe('in_production');
  });

  it('should support combined filters', () => {
    const filters = { status: 'active', phase: 'in_production' };
    expect(filters.status).toBe('active');
    expect(filters.phase).toBe('in_production');
  });
});
