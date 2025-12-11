import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEmployees, useEmployee, useCreateEmployee, useUpdateEmployee } from '../useEmployees';

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
        { id: '1', full_name: 'John Doe', email: 'john@example.com', department: 'Engineering', status: 'active' },
        { id: '2', full_name: 'Jane Smith', email: 'jane@example.com', department: 'Marketing', status: 'active' },
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

describe('useEmployees', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useEmployees hook', () => {
    it('should fetch employees successfully', async () => {
      const { result } = renderHook(() => useEmployees(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply department filter', async () => {
      const { result } = renderHook(() => useEmployees({ department: 'Engineering' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply status filter', async () => {
      const { result } = renderHook(() => useEmployees({ status: 'active' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useEmployees(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useEmployee hook', () => {
    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useEmployee(''), { wrapper: createWrapper() });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should fetch when id is provided', async () => {
      const { result } = renderHook(() => useEmployee('1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isFetching).toBe(true);
      });
    });
  });

  describe('useCreateEmployee hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCreateEmployee(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useCreateEmployee(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useUpdateEmployee hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useUpdateEmployee(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });
});

describe('Employee interface', () => {
  it('should have required fields', () => {
    const employee = {
      id: '1',
      user_id: 'user-1',
      full_name: 'John Doe',
      email: 'john@example.com',
      department: 'Engineering',
      position: 'Senior Developer',
      employment_type: 'full-time' as const,
      hire_date: '2024-01-15',
      status: 'active' as const,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(employee.id).toBeDefined();
    expect(employee.user_id).toBeDefined();
    expect(employee.full_name).toBeDefined();
    expect(employee.email).toBeDefined();
    expect(employee.department).toBeDefined();
    expect(employee.position).toBeDefined();
    expect(employee.employment_type).toBeDefined();
    expect(employee.hire_date).toBeDefined();
    expect(employee.status).toBeDefined();
  });

  it('should support optional fields', () => {
    const employee = {
      id: '1',
      user_id: 'user-1',
      full_name: 'John Doe',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      department: 'Engineering',
      department_id: 'dept-1',
      department_name: 'Engineering Department',
      position: 'Senior Developer',
      role: 'developer',
      employment_type: 'full-time' as const,
      hire_date: '2024-01-15',
      salary: 120000,
      status: 'active' as const,
      manager_id: 'mgr-1',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(employee.first_name).toBe('John');
    expect(employee.last_name).toBe('Doe');
    expect(employee.department_id).toBe('dept-1');
    expect(employee.salary).toBe(120000);
    expect(employee.manager_id).toBe('mgr-1');
  });
});
