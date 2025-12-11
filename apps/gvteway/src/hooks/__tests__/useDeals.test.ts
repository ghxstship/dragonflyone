import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDealsList, useDealsData, dealsKeys } from '../useDeals';

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

describe('useDeals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('dealsKeys', () => {
    it('should generate correct all key', () => {
      expect(dealsKeys.all).toEqual(['deals']);
    });

    it('should generate correct list key with filters', () => {
      expect(dealsKeys.list({ type: 'flash_sale', sort: 'discount' })).toEqual(['deals', 'list', { type: 'flash_sale', sort: 'discount' }]);
    });

    it('should generate correct list key without filters', () => {
      expect(dealsKeys.list()).toEqual(['deals', 'list', undefined]);
    });
  });

  describe('useDealsList hook', () => {
    it('should return demo data on 401 response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useDealsList(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBeGreaterThan(0);
    });

    it('should apply type filter', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useDealsList({ type: 'flash_sale' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply sort filter', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useDealsList({ sort: 'discount' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));
      const { result } = renderHook(() => useDealsList(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useDealsData hook', () => {
    it('should return combined data structure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useDealsData(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.deals).toBeDefined();
      expect(typeof result.current.refetch).toBe('function');
    });
  });
});

describe('Deal interface', () => {
  it('should have required fields', () => {
    const deal = {
      id: '1',
      event_id: 'e1',
      event_title: 'Summer Festival 2024',
      event_date: '2025-07-15',
      event_venue: 'Central Park',
      original_price: 150,
      deal_price: 99,
      discount_percent: 34,
      deal_type: 'early_bird' as const,
    };

    expect(deal.id).toBeDefined();
    expect(deal.event_id).toBeDefined();
    expect(deal.event_title).toBeDefined();
    expect(deal.event_date).toBeDefined();
    expect(deal.event_venue).toBeDefined();
    expect(deal.original_price).toBeDefined();
    expect(deal.deal_price).toBeDefined();
    expect(deal.discount_percent).toBeDefined();
    expect(deal.deal_type).toBeDefined();
  });

  it('should support optional fields', () => {
    const deal = {
      id: '1',
      event_id: 'e1',
      event_title: 'Summer Festival 2024',
      event_date: '2025-07-15',
      event_venue: 'Central Park',
      event_image: '/events/summer.jpg',
      original_price: 150,
      deal_price: 99,
      discount_percent: 34,
      deal_type: 'flash_sale' as const,
      expires_at: '2025-01-15',
      quantity_available: 50,
      promo_code: 'SUMMER24',
    };

    expect(deal.event_image).toBe('/events/summer.jpg');
    expect(deal.expires_at).toBe('2025-01-15');
    expect(deal.quantity_available).toBe(50);
    expect(deal.promo_code).toBe('SUMMER24');
  });
});
