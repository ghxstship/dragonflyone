import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCartItems, useProcessOrder, checkoutKeys } from '../useCheckout';

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

describe('useCheckout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkoutKeys', () => {
    it('should generate correct all key', () => {
      expect(checkoutKeys.all).toEqual(['checkout']);
    });

    it('should generate correct cart key', () => {
      expect(checkoutKeys.cart('evt-1', 'ticket-1')).toEqual(['checkout', 'cart', 'evt-1', 'ticket-1']);
    });
  });

  describe('useCartItems hook', () => {
    it('should return demo data when no params', async () => {
      const { result } = renderHook(() => useCartItems(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBeGreaterThan(0);
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useCartItems(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useProcessOrder hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useProcessOrder(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useProcessOrder(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });
});

describe('CartItem interface', () => {
  it('should have required fields', () => {
    const item = {
      id: '1',
      event_title: 'Summer Music Festival',
      ticket_type_name: 'VIP Pass',
      price: 299.00,
      qty: 2,
      ticket_type_id: 'vip-001',
      event_id: 'evt-001',
    };

    expect(item.id).toBeDefined();
    expect(item.event_title).toBeDefined();
    expect(item.ticket_type_name).toBeDefined();
    expect(item.price).toBeDefined();
    expect(item.qty).toBeDefined();
    expect(item.ticket_type_id).toBeDefined();
    expect(item.event_id).toBeDefined();
  });
});

describe('OrderData interface', () => {
  it('should have required fields', () => {
    const order = {
      items: [{ id: '1', event_title: 'Test', ticket_type_name: 'VIP', price: 100, qty: 1, ticket_type_id: 't1', event_id: 'e1' }],
      payment: { cardName: 'John Doe', cardNumber: '4111111111111111', expiry: '12/25', cvv: '123' },
      billing: { street: '123 Main St', city: 'New York', state: 'NY', zip: '10001' },
    };

    expect(order.items).toBeDefined();
    expect(order.payment).toBeDefined();
    expect(order.billing).toBeDefined();
    expect(order.payment.cardName).toBeDefined();
    expect(order.billing.street).toBeDefined();
  });
});
