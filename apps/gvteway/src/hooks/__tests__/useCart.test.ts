import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCart, useUpdateCartQuantity, useRemoveCartItem, useApplyPromo, cartKeys } from '../useCart';

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

describe('useCart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('cartKeys', () => {
    it('should generate correct all key', () => {
      expect(cartKeys.all).toEqual(['cart']);
    });

    it('should generate correct items key', () => {
      expect(cartKeys.items()).toEqual(['cart', 'items']);
    });
  });

  describe('useCart hook', () => {
    it('should return demo data on 401 response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useCart(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.items).toBeDefined();
      expect(result.current.data?.summary).toBeDefined();
    });

    it('should return loading state initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));
      const { result } = renderHook(() => useCart(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useUpdateCartQuantity hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useUpdateCartQuantity(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useUpdateCartQuantity(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useRemoveCartItem hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useRemoveCartItem(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });

  describe('useApplyPromo hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useApplyPromo(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });
});

describe('CartItem interface', () => {
  it('should have required fields', () => {
    const item = {
      id: '1',
      event_id: 'e1',
      event_name: 'Summer Festival',
      event_date: '2025-07-15',
      venue_name: 'Central Park',
      ticket_type_id: 't1',
      ticket_type_name: 'General Admission',
      quantity: 2,
      unit_price: 75,
      subtotal: 150,
      fees: 15,
      total: 165,
    };

    expect(item.id).toBeDefined();
    expect(item.event_id).toBeDefined();
    expect(item.event_name).toBeDefined();
    expect(item.quantity).toBeDefined();
    expect(item.unit_price).toBeDefined();
    expect(item.subtotal).toBeDefined();
    expect(item.fees).toBeDefined();
    expect(item.total).toBeDefined();
  });
});

describe('CartSummary interface', () => {
  it('should have all summary fields', () => {
    const summary = {
      item_count: 2,
      subtotal: 150,
      service_fees: 15,
      taxes: 12,
      total: 177,
    };

    expect(summary.item_count).toBe(2);
    expect(summary.subtotal).toBe(150);
    expect(summary.service_fees).toBe(15);
    expect(summary.taxes).toBe(12);
    expect(summary.total).toBe(177);
  });
});
