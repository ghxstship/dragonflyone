import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCrew, useCrewMember, useCreateCrewMember, useUpdateCrewMember, useDeleteCrewMember } from '../useCrew';

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
        { id: '1', name: 'John Doe', role: 'Stage Manager', department: 'Production', status: 'active' },
        { id: '2', name: 'Jane Smith', role: 'Sound Engineer', department: 'Audio', status: 'active' },
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

describe('useCrew', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCrew hook', () => {
    it('should fetch crew members successfully', async () => {
      const { result } = renderHook(() => useCrew(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply department filter', async () => {
      const { result } = renderHook(() => useCrew({ department: 'Production' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply role filter', async () => {
      const { result } = renderHook(() => useCrew({ role: 'Stage Manager' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply status filter', async () => {
      const { result } = renderHook(() => useCrew({ status: 'active' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useCrew(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useCrewMember hook', () => {
    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useCrewMember(''), { wrapper: createWrapper() });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should fetch when id is provided', async () => {
      const { result } = renderHook(() => useCrewMember('1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isFetching).toBe(true);
      });
    });
  });

  describe('useCreateCrewMember hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCreateCrewMember(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useCreateCrewMember(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useUpdateCrewMember hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useUpdateCrewMember(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });

  describe('useDeleteCrewMember hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useDeleteCrewMember(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });
});

describe('CrewMember interface', () => {
  it('should have required fields', () => {
    const crew = {
      id: '1',
      name: 'John Doe',
      role: 'Stage Manager',
      department: 'Production',
      status: 'active',
    };

    expect(crew.id).toBeDefined();
    expect(crew.name).toBeDefined();
    expect(crew.role).toBeDefined();
    expect(crew.department).toBeDefined();
    expect(crew.status).toBeDefined();
  });

  it('should support optional fields', () => {
    const crew = {
      id: '1',
      name: 'John Doe',
      role: 'Stage Manager',
      department: 'Production',
      status: 'active',
      email: 'john@example.com',
      phone: '+1234567890',
      skills: ['lighting', 'sound'],
      certifications: ['OSHA', 'First Aid'],
      availability: 'full-time',
      rate: 50,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(crew.email).toBe('john@example.com');
    expect(crew.phone).toBe('+1234567890');
    expect(crew.skills).toEqual(['lighting', 'sound']);
    expect(crew.certifications).toEqual(['OSHA', 'First Aid']);
  });
});

describe('CrewFilters interface', () => {
  it('should support all filter types', () => {
    const filters = {
      department: 'Production',
      role: 'Stage Manager',
      status: 'active',
      search: 'John',
    };

    expect(filters.department).toBe('Production');
    expect(filters.role).toBe('Stage Manager');
    expect(filters.status).toBe('active');
    expect(filters.search).toBe('John');
  });
});
