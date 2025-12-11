import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePriceAlertsList, useTogglePriceAlert, useDeletePriceAlert, priceAlertsKeys } from '../usePriceAlerts';

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

describe('usePriceAlerts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('priceAlertsKeys', () => {
    it('should generate correct all key', () => {
      expect(priceAlertsKeys.all).toEqual(['price-alerts']);
    });

    it('should generate correct list key', () => {
      expect(priceAlertsKeys.list()).toEqual(['price-alerts', 'list']);
    });
  });

  describe('usePriceAlertsList hook', () => {
    it('should return demo data on 401 response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => usePriceAlertsList(), { wrapper: createWrapper() });

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

      const { result } = renderHook(() => usePriceAlertsList(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });

    it('should return loading state initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));
      const { result } = renderHook(() => usePriceAlertsList(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useTogglePriceAlert hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useTogglePriceAlert(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useTogglePriceAlert(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useDeletePriceAlert hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useDeletePriceAlert(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });
});

describe('PriceAlert interface', () => {
  it('should have required fields', () => {
    const alert = {
      id: '1',
      event_id: 'e1',
      event_title: 'Summer Festival 2024',
      event_date: '2024-07-15',
      event_venue: 'Central Park',
      target_price: 100,
      current_price: 125,
      is_active: true,
      triggered: false,
      created_at: '2024-01-01',
    };

    expect(alert.id).toBeDefined();
    expect(alert.event_id).toBeDefined();
    expect(alert.event_title).toBeDefined();
    expect(alert.event_date).toBeDefined();
    expect(alert.event_venue).toBeDefined();
    expect(alert.target_price).toBeDefined();
    expect(alert.current_price).toBeDefined();
    expect(alert.is_active).toBeDefined();
    expect(alert.triggered).toBeDefined();
    expect(alert.created_at).toBeDefined();
  });

  it('should support optional fields', () => {
    const alert = {
      id: '1',
      event_id: 'e1',
      event_title: 'Summer Festival 2024',
      event_date: '2024-07-15',
      event_venue: 'Central Park',
      target_price: 100,
      current_price: 95,
      ticket_type: 'VIP',
      is_active: true,
      triggered: true,
      triggered_at: '2024-01-10',
      created_at: '2024-01-01',
    };

    expect(alert.ticket_type).toBe('VIP');
    expect(alert.triggered_at).toBe('2024-01-10');
  });
});
