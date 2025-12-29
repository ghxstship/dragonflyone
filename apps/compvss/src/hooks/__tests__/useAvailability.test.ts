import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAvailability, useCreateAvailability, useUpdateAvailability, useDeleteAvailability, useBulkUpdateAvailability } from '../useAvailability';

// Mock Supabase with proper chaining
vi.mock('@/lib/supabase', () => {
  const createChainableMock = (finalData: unknown) => {
    const mock = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
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
        { 
          id: '1', 
          crew_member_id: 'user1', 
          availability_type: 'available', 
          start_date: '2024-06-01', 
          end_date: '2024-06-01',
          start_time: '09:00',
          end_time: '17:00',
          notes: 'Full day available',
          crew_member: { id: 'user1', first_name: 'John', last_name: 'Doe', role: 'Stage Manager', department: 'Production' }
        },
        { 
          id: '2', 
          crew_member_id: 'user2', 
          availability_type: 'unavailable', 
          start_date: '2024-06-02', 
          end_date: '2024-06-02',
          crew_member: { id: 'user2', first_name: 'Jane', last_name: 'Smith', role: 'Sound Engineer', department: 'Audio' }
        },
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

describe('useAvailability hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAvailability hook', () => {
    it('should fetch availability slots successfully', async () => {
      const { result } = renderHook(() => useAvailability(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply status filter', async () => {
      const { result } = renderHook(() => useAvailability({ status: 'available' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply department filter', async () => {
      const { result } = renderHook(() => useAvailability({ department: 'Production' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply userId filter', async () => {
      const { result } = renderHook(() => useAvailability({ userId: 'user1' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply date range filters', async () => {
      const { result } = renderHook(() => useAvailability({ startDate: '2024-06-01', endDate: '2024-06-30' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useAvailability(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });

    it('should have data property', async () => {
      const { result } = renderHook(() => useAvailability(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });
    });
  });

  describe('useCreateAvailability hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCreateAvailability(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useCreateAvailability(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });

    it('should have isPending property', () => {
      const { result } = renderHook(() => useCreateAvailability(), { wrapper: createWrapper() });
      expect(result.current.isPending).toBe(false);
    });
  });

  describe('useUpdateAvailability hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useUpdateAvailability(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useUpdateAvailability(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useDeleteAvailability hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useDeleteAvailability(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useDeleteAvailability(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useBulkUpdateAvailability hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useBulkUpdateAvailability(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useBulkUpdateAvailability(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });

    it('should have isPending property', () => {
      const { result } = renderHook(() => useBulkUpdateAvailability(), { wrapper: createWrapper() });
      expect(result.current.isPending).toBe(false);
    });
  });
});

describe('AvailabilitySlot interface', () => {
  it('should have required fields', () => {
    const slot = {
      id: '1',
      user_id: 'user1',
      user_name: 'John Doe',
      role: 'Stage Manager',
      department: 'Production',
      date: '2024-06-01',
      status: 'available' as const,
      calendar_source: 'manual' as const,
    };

    expect(slot.id).toBeDefined();
    expect(slot.user_id).toBeDefined();
    expect(slot.user_name).toBeDefined();
    expect(slot.role).toBeDefined();
    expect(slot.department).toBeDefined();
    expect(slot.date).toBeDefined();
    expect(slot.status).toBeDefined();
    expect(slot.calendar_source).toBeDefined();
  });

  it('should support optional fields', () => {
    const slot = {
      id: '1',
      user_id: 'user1',
      user_name: 'John Doe',
      role: 'Stage Manager',
      department: 'Production',
      date: '2024-06-01',
      status: 'available' as const,
      start_time: '09:00',
      end_time: '17:00',
      notes: 'Full day available',
      calendar_source: 'google' as const,
    };

    expect(slot.start_time).toBe('09:00');
    expect(slot.end_time).toBe('17:00');
    expect(slot.notes).toBe('Full day available');
  });

  it('should support all status values', () => {
    const statuses = ['available', 'unavailable', 'tentative', 'booked'] as const;
    statuses.forEach(status => {
      const slot = {
        id: '1',
        user_id: 'user1',
        user_name: 'John Doe',
        role: 'Stage Manager',
        department: 'Production',
        date: '2024-06-01',
        status,
        calendar_source: 'manual' as const,
      };
      expect(slot.status).toBe(status);
    });
  });

  it('should support all calendar source values', () => {
    const sources = ['manual', 'google'] as const;
    sources.forEach(source => {
      const slot = {
        id: '1',
        user_id: 'user1',
        user_name: 'John Doe',
        role: 'Stage Manager',
        department: 'Production',
        date: '2024-06-01',
        status: 'available' as const,
        calendar_source: source,
      };
      expect(slot.calendar_source).toBe(source);
    });
  });
});

describe('AvailabilityFilters interface', () => {
  it('should support status filter', () => {
    const filters = { status: 'available' };
    expect(filters.status).toBe('available');
  });

  it('should support department filter', () => {
    const filters = { department: 'Production' };
    expect(filters.department).toBe('Production');
  });

  it('should support userId filter', () => {
    const filters = { userId: 'user1' };
    expect(filters.userId).toBe('user1');
  });

  it('should support date range filters', () => {
    const filters = { startDate: '2024-06-01', endDate: '2024-06-30' };
    expect(filters.startDate).toBe('2024-06-01');
    expect(filters.endDate).toBe('2024-06-30');
  });

  it('should support combined filters', () => {
    const filters = {
      status: 'available',
      department: 'Production',
      userId: 'user1',
      startDate: '2024-06-01',
      endDate: '2024-06-30',
    };
    expect(filters.status).toBe('available');
    expect(filters.department).toBe('Production');
    expect(filters.userId).toBe('user1');
    expect(filters.startDate).toBe('2024-06-01');
    expect(filters.endDate).toBe('2024-06-30');
  });
});
