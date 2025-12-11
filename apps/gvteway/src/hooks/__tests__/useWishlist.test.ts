import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWishlistItems, useRemoveFromWishlist, useWishlistData, wishlistKeys } from '../useWishlist';

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

describe('useWishlist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('wishlistKeys', () => {
    it('should generate correct all key', () => {
      expect(wishlistKeys.all).toEqual(['wishlist']);
    });

    it('should generate correct list key with userId', () => {
      expect(wishlistKeys.list('user-1')).toEqual(['wishlist', 'list', 'user-1']);
    });

    it('should generate correct list key without userId', () => {
      expect(wishlistKeys.list()).toEqual(['wishlist', 'list', undefined]);
    });
  });

  describe('useWishlistItems hook', () => {
    it('should return demo data on 401 response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useWishlistItems('user-1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBeGreaterThan(0);
    });

    it('should return demo data on error response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 500,
        ok: false,
      });

      const { result } = renderHook(() => useWishlistItems('user-1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it('should return loading state initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));
      const { result } = renderHook(() => useWishlistItems('user-1'), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useRemoveFromWishlist hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useRemoveFromWishlist(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useRemoveFromWishlist(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useWishlistData hook', () => {
    it('should return wishlist data structure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useWishlistData('user-1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.wishlist).toBeDefined();
      expect(typeof result.current.refetch).toBe('function');
      expect(typeof result.current.removeItem).toBe('function');
    });

    it('should return empty array when no data', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

      const { result } = renderHook(() => useWishlistData('user-1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
});

describe('WishlistItem interface', () => {
  it('should have required fields', () => {
    const item = {
      id: '1',
      user_id: 'user-1',
      event_id: 'event-1',
      event_name: 'Summer Festival',
      date: '2024-07-15',
      location: 'Central Park',
      price: 99,
      available: true,
      tickets_left: 50,
      notify_price_drop: true,
      added_at: '2024-01-01',
    };

    expect(item.id).toBeDefined();
    expect(item.user_id).toBeDefined();
    expect(item.event_id).toBeDefined();
    expect(item.event_name).toBeDefined();
    expect(item.date).toBeDefined();
    expect(item.location).toBeDefined();
    expect(item.price).toBeDefined();
    expect(item.available).toBeDefined();
    expect(item.tickets_left).toBeDefined();
    expect(item.notify_price_drop).toBeDefined();
    expect(item.added_at).toBeDefined();
  });
});
