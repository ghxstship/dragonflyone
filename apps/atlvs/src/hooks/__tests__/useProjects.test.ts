import React, { type ReactNode, type PropsWithChildren } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, type RenderHookOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProjects, useProject, useCreateProject, useUpdateProject, useDeleteProject } from '../useProjects';
import { supabase } from '@/lib/supabase';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '1' }, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: '1' }, error: null })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

// Type assertion needed due to React types version mismatch in monorepo
const createWrapper = (): (({ children }: { children: ReactNode }) => JSX.Element) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
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

  it('should fetch projects list', async () => {
    const mockProjects = [
      { id: '1', name: 'Project 1', status: 'active' },
      { id: '2', name: 'Project 2', status: 'planning' },
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockProjects, error: null }),
      }),
    } as any);

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper() as any,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockProjects);
  });

  it('should filter projects by status', async () => {
    const mockProjects = [{ id: '1', name: 'Project 1', status: 'active' }];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: mockProjects, error: null }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useProjects({ status: 'active' }), {
      wrapper: createWrapper() as any,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockProjects);
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: new Error('Database error') }),
      }),
    } as any);

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper() as any,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useProject', () => {
  it('should fetch single project by id', async () => {
    const mockProject = { id: '1', name: 'Project 1', status: 'active' };

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockProject, error: null }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useProject('1'), {
      wrapper: createWrapper() as any,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockProject);
  });

  it('should not fetch when id is empty', () => {
    const { result } = renderHook(() => useProject(''), {
      wrapper: createWrapper() as any,
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useCreateProject', () => {
  it('should create a new project', async () => {
    const newProject = { name: 'New Project', status: 'planning' as const, start_date: '2024-01-01' };
    const createdProject = { id: '1', ...newProject };

    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: createdProject, error: null }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useCreateProject(), {
      wrapper: createWrapper() as any,
    });

    result.current.mutate(newProject);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(createdProject);
  });
});

describe('useUpdateProject', () => {
  it('should update an existing project', async () => {
    const updates = { id: '1', name: 'Updated Project' };
    const updatedProject = { id: '1', name: 'Updated Project', status: 'active' };

    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: updatedProject, error: null }),
          }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useUpdateProject(), {
      wrapper: createWrapper() as any,
    });

    result.current.mutate(updates);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(updatedProject);
  });
});

describe('useDeleteProject', () => {
  it('should delete a project', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    } as any);

    const { result } = renderHook(() => useDeleteProject(), {
      wrapper: createWrapper() as any,
    });

    result.current.mutate('1');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
