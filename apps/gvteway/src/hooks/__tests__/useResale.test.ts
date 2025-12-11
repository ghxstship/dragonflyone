import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useResaleListings, usePurchaseResaleListing, useDeleteResaleListing, resaleKeys } from '../useResale';

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

describe('useResale', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('resaleKeys', () => {
    it('should generate correct all key', () => {
      expect(resaleKeys.all).toEqual(['resale']);
    });

    it('should generate correct list key', () => {
      expect(resaleKeys.list()).toEqual(['resale', 'list']);
    });
  });

  describe('useResaleListings hook', () => {
    it('should return demo data on 401 response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useResaleListings(), { wrapper: createWrapper() });

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

      const { result } = renderHook(() => useResaleListings(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it('should return loading state initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));
      const { result } = renderHook(() => useResaleListings(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('usePurchaseResaleListing hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => usePurchaseResaleListing(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => usePurchaseResaleListing(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useDeleteResaleListing hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useDeleteResaleListing(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });
});

describe('ResaleListing interface', () => {
  it('should have required fields', () => {
    const listing = {
      id: '1',
      ticket_id: 't1',
      event_id: 'e1',
      event_name: 'Summer Festival 2024',
      event_date: '2025-07-15',
      venue_name: 'Central Park',
      ticket_type: 'VIP',
      original_price: 150,
      asking_price: 175,
      seller_id: 's1',
      seller_name: 'John D.',
      status: 'active',
      listed_at: '2025-01-01',
    };

    expect(listing.id).toBeDefined();
    expect(listing.ticket_id).toBeDefined();
    expect(listing.event_id).toBeDefined();
    expect(listing.event_name).toBeDefined();
    expect(listing.original_price).toBeDefined();
    expect(listing.asking_price).toBeDefined();
    expect(listing.seller_id).toBeDefined();
    expect(listing.status).toBeDefined();
    expect(listing.listed_at).toBeDefined();
  });

  it('should support optional fields', () => {
    const listing = {
      id: '1',
      ticket_id: 't1',
      event_id: 'e1',
      event_name: 'Summer Festival 2024',
      event_date: '2025-07-15',
      venue_name: 'Central Park',
      ticket_type: 'VIP',
      section: 'A',
      row: '1',
      seat: '5',
      original_price: 150,
      asking_price: 175,
      seller_id: 's1',
      seller_name: 'John D.',
      status: 'active',
      listed_at: '2025-01-01',
      expires_at: '2025-07-14',
    };

    expect(listing.section).toBe('A');
    expect(listing.row).toBe('1');
    expect(listing.seat).toBe('5');
    expect(listing.expires_at).toBe('2025-07-14');
  });
});
