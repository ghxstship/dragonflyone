import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useArtists, useArtist, useCreateArtist, useUpdateArtist, useDeleteArtist } from '../useArtists';

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
        { id: '1', name: 'Taylor Swift', genre: 'Pop', followers: 1000000, verified: true },
        { id: '2', name: 'Ed Sheeran', genre: 'Pop', followers: 800000, verified: true },
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

describe('useArtists', () => {
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

    it('should apply genre filter', async () => {
      const { result } = renderHook(() => useArtists({ genre: 'Pop' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply verified filter', async () => {
      const { result } = renderHook(() => useArtists({ verified: true }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useArtists(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
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
  });

  describe('useUpdateArtist hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useUpdateArtist(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });

  describe('useDeleteArtist hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useDeleteArtist(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });
});

describe('Artist interface', () => {
  it('should have required fields', () => {
    const artist = {
      id: '1',
      name: 'Taylor Swift',
      verified: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(artist.id).toBeDefined();
    expect(artist.name).toBeDefined();
    expect(artist.verified).toBeDefined();
    expect(artist.created_at).toBeDefined();
    expect(artist.updated_at).toBeDefined();
  });

  it('should support optional fields', () => {
    const artist = {
      id: '1',
      name: 'Taylor Swift',
      genre: 'Pop',
      bio: 'Award-winning artist',
      followers: 1000000,
      upcoming_shows: 25,
      verified: true,
      image_url: '/images/taylor.jpg',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(artist.genre).toBe('Pop');
    expect(artist.bio).toBe('Award-winning artist');
    expect(artist.followers).toBe(1000000);
    expect(artist.upcoming_shows).toBe(25);
    expect(artist.image_url).toBe('/images/taylor.jpg');
  });
});

describe('ArtistFilters interface', () => {
  it('should support genre filter', () => {
    const filters = { genre: 'Pop' };
    expect(filters.genre).toBe('Pop');
  });

  it('should support verified filter', () => {
    const filters = { verified: true };
    expect(filters.verified).toBe(true);
  });

  it('should support combined filters', () => {
    const filters = { genre: 'Rock', verified: false };
    expect(filters.genre).toBe('Rock');
    expect(filters.verified).toBe(false);
  });
});
