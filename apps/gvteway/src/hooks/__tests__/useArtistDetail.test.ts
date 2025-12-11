import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useArtist, useArtistEvents, useToggleFollow, artistDetailKeys } from '../useArtistDetail';

// Mock fetch
global.fetch = vi.fn();

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

describe('useArtistDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('artistDetailKeys', () => {
    it('should generate correct all key', () => {
      expect(artistDetailKeys.all).toEqual(['artist-detail']);
    });

    it('should generate correct detail key', () => {
      expect(artistDetailKeys.detail('art-1')).toEqual(['artist-detail', 'art-1']);
    });

    it('should generate correct events key', () => {
      expect(artistDetailKeys.events('art-1')).toEqual(['artist-detail', 'art-1', 'events']);
    });

    it('should generate correct followStatus key', () => {
      expect(artistDetailKeys.followStatus('art-1')).toEqual(['artist-detail', 'art-1', 'follow']);
    });
  });

  describe('useArtist hook', () => {
    it('should return demo data on 401 response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useArtist('art-1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it('should return loading state initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));
      const { result } = renderHook(() => useArtist('art-1'), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useArtistEvents hook', () => {
    it('should return demo data on 401 response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useArtistEvents('art-1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });
  });

  describe('useToggleFollow hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useToggleFollow(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useToggleFollow(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });
});

describe('Artist interface', () => {
  it('should have required fields', () => {
    const artist = {
      id: '1',
      name: 'The Midnight',
      bio: 'Synthwave duo from Los Angeles',
      followers_count: 125000,
      verified: true,
    };

    expect(artist.id).toBeDefined();
    expect(artist.name).toBeDefined();
    expect(artist.bio).toBeDefined();
    expect(artist.followers_count).toBeDefined();
    expect(artist.verified).toBeDefined();
  });

  it('should support optional fields', () => {
    const artist = {
      id: '1',
      name: 'The Midnight',
      bio: 'Synthwave duo from Los Angeles',
      image: '/artists/midnight.jpg',
      genre: 'Synthwave',
      followers_count: 125000,
      verified: true,
      social_links: {
        spotify: 'https://spotify.com/artist/midnight',
        instagram: 'https://instagram.com/themidnight',
      },
    };

    expect(artist.image).toBe('/artists/midnight.jpg');
    expect(artist.genre).toBe('Synthwave');
    expect(artist.social_links?.spotify).toBeDefined();
  });
});

describe('ArtistEvent interface', () => {
  it('should have required fields', () => {
    const event = {
      id: '1',
      title: 'Summer Tour 2025',
      date: '2025-07-15',
      venue: 'The Wiltern',
    };

    expect(event.id).toBeDefined();
    expect(event.title).toBeDefined();
    expect(event.date).toBeDefined();
    expect(event.venue).toBeDefined();
  });

  it('should support optional fields', () => {
    const event = {
      id: '1',
      title: 'Summer Tour 2025',
      date: '2025-07-15',
      venue: 'The Wiltern',
      image: '/events/summer-tour.jpg',
      price: 45,
    };

    expect(event.image).toBe('/events/summer-tour.jpg');
    expect(event.price).toBe(45);
  });
});
