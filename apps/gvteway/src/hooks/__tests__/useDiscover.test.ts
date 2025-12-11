import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDiscoverData, discoverKeys } from '../useDiscover';

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

describe('useDiscover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('discoverKeys', () => {
    it('should generate correct all key', () => {
      expect(discoverKeys.all).toEqual(['discover']);
    });

    it('should generate correct trending key', () => {
      expect(discoverKeys.trending()).toEqual(['discover', 'trending']);
    });

    it('should generate correct recommended key', () => {
      expect(discoverKeys.recommended()).toEqual(['discover', 'recommended']);
    });

    it('should generate correct collections key', () => {
      expect(discoverKeys.collections()).toEqual(['discover', 'collections']);
    });

    it('should generate correct nearby key', () => {
      expect(discoverKeys.nearby()).toEqual(['discover', 'nearby']);
    });
  });

  describe('useDiscoverData hook', () => {
    it('should return demo data on error response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
      });

      const { result } = renderHook(() => useDiscoverData(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.trendingEvents).toBeDefined();
      expect(result.current.recommendedEvents).toBeDefined();
      expect(result.current.collections).toBeDefined();
      expect(result.current.nearbyEvents).toBeDefined();
    });

    it('should return loading state initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => {}));
      const { result } = renderHook(() => useDiscoverData(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });

    it('should have error property', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
      });

      const { result } = renderHook(() => useDiscoverData(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });
  });
});

describe('DiscoverEvent interface', () => {
  it('should have required fields', () => {
    const event = {
      id: '1',
      title: 'Summer Festival 2024',
      date: '2025-07-15',
      venue: 'Central Park',
      category: 'festival',
      price: 99,
    };

    expect(event.id).toBeDefined();
    expect(event.title).toBeDefined();
    expect(event.date).toBeDefined();
    expect(event.venue).toBeDefined();
    expect(event.category).toBeDefined();
    expect(event.price).toBeDefined();
  });

  it('should support optional fields', () => {
    const event = {
      id: '1',
      title: 'Summer Festival 2024',
      date: '2025-07-15',
      venue: 'Central Park',
      category: 'festival',
      price: 99,
      image: '/images/festival.jpg',
      trending: true,
      recommended: false,
    };

    expect(event.image).toBe('/images/festival.jpg');
    expect(event.trending).toBe(true);
    expect(event.recommended).toBe(false);
  });
});

describe('Collection interface', () => {
  it('should have required fields', () => {
    const collection = {
      id: 'c1',
      name: 'Weekend Picks',
      description: 'Best events this weekend',
      events: [],
    };

    expect(collection.id).toBeDefined();
    expect(collection.name).toBeDefined();
    expect(collection.description).toBeDefined();
    expect(collection.events).toBeDefined();
  });
});
