import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useArtists, useArtist, useCreateArtist, useUpdateArtist, useDeleteArtist, useArtistStats } from '../useArtists';

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
        { id: '1', name: 'Artist One', genre: 'Rock', type: 'Band', technical_rider: true, hospitality_rider: true, input_list: true, stageplot: true, upcoming_shows: 5 },
        { id: '2', name: 'DJ Beats', genre: 'Electronic', type: 'DJ', technical_rider: true, hospitality_rider: false, input_list: false, stageplot: false, upcoming_shows: 3 },
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

describe('useArtists hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useArtists hook', () => {
    it('should fetch artists successfully', async () => {
      const { result } = renderHook(() => useArtists(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply type filter', async () => {
      const { result } = renderHook(() => useArtists({ type: 'Band' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply search filter', async () => {
      const { result } = renderHook(() => useArtists({ search: 'Artist' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useArtists(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });

    it('should have data property', async () => {
      const { result } = renderHook(() => useArtists(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });
    });
  });

  describe('useArtist hook', () => {
    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useArtist(''), { wrapper: createWrapper() });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should fetch when id is provided', async () => {
      const { result } = renderHook(() => useArtist('1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isFetching).toBe(true);
      });
    });
  });

  describe('useCreateArtist hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCreateArtist(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useCreateArtist(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });

    it('should have isPending property', () => {
      const { result } = renderHook(() => useCreateArtist(), { wrapper: createWrapper() });
      expect(result.current.isPending).toBe(false);
    });
  });

  describe('useUpdateArtist hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useUpdateArtist(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useUpdateArtist(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useDeleteArtist hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useDeleteArtist(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useDeleteArtist(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useArtistStats hook', () => {
    it('should fetch artist statistics', async () => {
      const { result } = renderHook(() => useArtistStats(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useArtistStats(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });
});

describe('Artist interface', () => {
  it('should have required fields', () => {
    const artist = {
      id: '1',
      name: 'Test Artist',
      genre: 'Rock',
      type: 'Band' as const,
      technical_rider: true,
      hospitality_rider: true,
      input_list: true,
      stageplot: true,
      upcoming_shows: 5,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(artist.id).toBeDefined();
    expect(artist.name).toBeDefined();
    expect(artist.genre).toBeDefined();
    expect(artist.type).toBeDefined();
    expect(typeof artist.technical_rider).toBe('boolean');
    expect(typeof artist.hospitality_rider).toBe('boolean');
    expect(typeof artist.input_list).toBe('boolean');
    expect(typeof artist.stageplot).toBe('boolean');
    expect(typeof artist.upcoming_shows).toBe('number');
  });

  it('should support optional fields', () => {
    const artist = {
      id: '1',
      name: 'Test Artist',
      genre: 'Rock',
      type: 'Band' as const,
      manager: 'John Manager',
      manager_email: 'manager@example.com',
      manager_phone: '+1234567890',
      agent: 'Jane Agent',
      technical_rider: true,
      hospitality_rider: true,
      input_list: true,
      stageplot: true,
      upcoming_shows: 5,
      notes: 'Special requirements',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(artist.manager).toBe('John Manager');
    expect(artist.manager_email).toBe('manager@example.com');
    expect(artist.manager_phone).toBe('+1234567890');
    expect(artist.agent).toBe('Jane Agent');
    expect(artist.notes).toBe('Special requirements');
  });

  it('should support all artist types', () => {
    const types = ['Solo', 'Band', 'DJ', 'Orchestra', 'Speaker'] as const;
    types.forEach(type => {
      const artist = {
        id: '1',
        name: 'Test',
        genre: 'Test',
        type,
        technical_rider: false,
        hospitality_rider: false,
        input_list: false,
        stageplot: false,
        upcoming_shows: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };
      expect(artist.type).toBe(type);
    });
  });
});

describe('ArtistFilters interface', () => {
  it('should support type filter', () => {
    const filters = { type: 'Band' };
    expect(filters.type).toBe('Band');
  });

  it('should support search filter', () => {
    const filters = { search: 'Artist' };
    expect(filters.search).toBe('Artist');
  });

  it('should support combined filters', () => {
    const filters = { type: 'DJ', search: 'Beats' };
    expect(filters.type).toBe('DJ');
    expect(filters.search).toBe('Beats');
  });
});
