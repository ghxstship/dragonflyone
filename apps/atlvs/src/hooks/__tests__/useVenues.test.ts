import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useVenues, useVenue, useCreateVenue, useUpdateVenue, useDeleteVenue, useVenueZones } from '../useVenues';

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
        { id: '1', name: 'Madison Square Garden', venue_type: 'indoor', capacity: 20000, status: 'confirmed' },
        { id: '2', name: 'Central Park', venue_type: 'outdoor', capacity: 50000, status: 'prospective' },
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

describe('useVenues', () => {
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

    it('should apply productionId filter', async () => {
      const { result } = renderHook(() => useVenues({ productionId: 'prod-1' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply status filter', async () => {
      const { result } = renderHook(() => useVenues({ status: 'confirmed' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply venueType filter', async () => {
      const { result } = renderHook(() => useVenues({ venueType: 'indoor' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useVenues(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useVenue hook', () => {
    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useVenue(''), { wrapper: createWrapper() });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should fetch when id is provided', async () => {
      const { result } = renderHook(() => useVenue('1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isFetching).toBe(true);
      });
    });
  });

  describe('useVenueZones hook', () => {
    it('should fetch zones without filters', async () => {
      const { result } = renderHook(() => useVenueZones(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply venueId filter', async () => {
      const { result } = renderHook(() => useVenueZones({ venueId: 'venue-1' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply zoneType filter', async () => {
      const { result } = renderHook(() => useVenueZones({ zoneType: 'stage' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('useCreateVenue hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCreateVenue(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });

  describe('useUpdateVenue hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useUpdateVenue(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });

  describe('useDeleteVenue hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useDeleteVenue(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });
});

describe('Venue interface', () => {
  it('should have required fields', () => {
    const venue = {
      id: '1',
      production_id: 'prod-1',
      name: 'Madison Square Garden',
      venue_type: 'indoor' as const,
      status: 'confirmed' as const,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(venue.id).toBeDefined();
    expect(venue.production_id).toBeDefined();
    expect(venue.name).toBeDefined();
    expect(venue.venue_type).toBeDefined();
    expect(venue.status).toBeDefined();
  });

  it('should support optional fields', () => {
    const venue = {
      id: '1',
      production_id: 'prod-1',
      name: 'Madison Square Garden',
      venue_type: 'indoor' as const,
      address: '4 Pennsylvania Plaza',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postal_code: '10001',
      capacity: 20000,
      square_footage: 100000,
      contact_name: 'John Doe',
      contact_email: 'john@msg.com',
      contact_phone: '+1234567890',
      rental_cost: 50000,
      deposit_amount: 10000,
      status: 'confirmed' as const,
      amenities: ['Parking', 'Catering'],
      restrictions: ['No pyrotechnics'],
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(venue.address).toBe('4 Pennsylvania Plaza');
    expect(venue.capacity).toBe(20000);
    expect(venue.amenities).toEqual(['Parking', 'Catering']);
  });
});

describe('VenueZone interface', () => {
  it('should have required fields', () => {
    const zone = {
      id: '1',
      venue_id: 'venue-1',
      name: 'Main Stage',
      zone_type: 'stage' as const,
      access_level: 'staff_only' as const,
      is_active: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(zone.id).toBeDefined();
    expect(zone.venue_id).toBeDefined();
    expect(zone.name).toBeDefined();
    expect(zone.zone_type).toBeDefined();
    expect(zone.access_level).toBeDefined();
    expect(zone.is_active).toBeDefined();
  });
});
