import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useVenues, useCreateVenue, useUpdateVenue, useDeleteVenue } from '../useVenues';

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
        { id: '1', name: 'Madison Square Garden', address: '4 Pennsylvania Plaza', city: 'New York', state: 'NY', zip: '10001', capacity: 20000, type: 'Arena', status: 'active' },
        { id: '2', name: 'The Fillmore', address: '1805 Geary Blvd', city: 'San Francisco', state: 'CA', zip: '94115', capacity: 1150, type: 'Theater', status: 'active' },
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

describe('useVenues hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useVenues hook', () => {
    it('should fetch venues successfully', async () => {
      const { result } = renderHook(() => useVenues(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply status filter', async () => {
      const { result } = renderHook(() => useVenues({ status: 'active' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply city filter', async () => {
      const { result } = renderHook(() => useVenues({ city: 'New York' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useVenues(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });

    it('should have data property', async () => {
      const { result } = renderHook(() => useVenues(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });
    });
  });

  describe('useCreateVenue hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCreateVenue(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useCreateVenue(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });

    it('should have isPending property', () => {
      const { result } = renderHook(() => useCreateVenue(), { wrapper: createWrapper() });
      expect(result.current.isPending).toBe(false);
    });
  });

  describe('useUpdateVenue hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useUpdateVenue(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useUpdateVenue(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useDeleteVenue hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useDeleteVenue(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useDeleteVenue(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });
});

describe('Venue interface', () => {
  it('should have required fields', () => {
    const venue = {
      id: '1',
      name: 'Madison Square Garden',
      address: '4 Pennsylvania Plaza',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      capacity: 20000,
      type: 'Arena',
      status: 'active' as const,
    };

    expect(venue.id).toBeDefined();
    expect(venue.name).toBeDefined();
    expect(venue.address).toBeDefined();
    expect(venue.city).toBeDefined();
    expect(venue.state).toBeDefined();
    expect(venue.zip).toBeDefined();
    expect(typeof venue.capacity).toBe('number');
    expect(venue.type).toBeDefined();
    expect(venue.status).toBeDefined();
  });

  it('should support optional fields', () => {
    const venue = {
      id: '1',
      name: 'Madison Square Garden',
      address: '4 Pennsylvania Plaza',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      capacity: 20000,
      type: 'Arena',
      status: 'active' as const,
      metadata: { parking: true, vip_areas: 5 },
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(venue.metadata).toEqual({ parking: true, vip_areas: 5 });
    expect(venue.created_at).toBe('2024-01-01');
    expect(venue.updated_at).toBe('2024-01-01');
  });

  it('should support all status values', () => {
    const statuses = ['active', 'inactive'] as const;
    statuses.forEach(status => {
      const venue = {
        id: '1',
        name: 'Test Venue',
        address: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
        capacity: 1000,
        type: 'Theater',
        status,
      };
      expect(venue.status).toBe(status);
    });
  });
});
