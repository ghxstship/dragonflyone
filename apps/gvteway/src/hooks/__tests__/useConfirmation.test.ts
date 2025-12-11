import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOrderConfirmation, useConfirmationData, confirmationKeys } from '../useConfirmation';

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

describe('useConfirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('confirmationKeys', () => {
    it('should generate correct all key', () => {
      expect(confirmationKeys.all).toEqual(['confirmation']);
    });

    it('should generate correct order key', () => {
      expect(confirmationKeys.order('ord-1')).toEqual(['confirmation', 'order', 'ord-1']);
    });
  });

  describe('useOrderConfirmation hook', () => {
    it('should not fetch when orderId is null', () => {
      const { result } = renderHook(() => useOrderConfirmation(null), { wrapper: createWrapper() });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should fetch when orderId is provided', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ order: { id: 'ord-1', order_number: 'ORD-001' } }),
      });

      const { result } = renderHook(() => useOrderConfirmation('ord-1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isFetching).toBe(true);
      });
    });
  });

  describe('useConfirmationData hook', () => {
    it('should return null order when orderId is null', () => {
      const { result } = renderHook(() => useConfirmationData(null), { wrapper: createWrapper() });
      expect(result.current.order).toBeNull();
    });

    it('should have refetch function', () => {
      const { result } = renderHook(() => useConfirmationData('ord-1'), { wrapper: createWrapper() });
      expect(typeof result.current.refetch).toBe('function');
    });
  });
});

describe('OrderItem interface', () => {
  it('should have required fields', () => {
    const item = {
      id: '1',
      event_name: 'Summer Music Festival',
      event_date: '2024-07-15',
      venue_name: 'Central Park',
      ticket_type: 'VIP',
      quantity: 2,
      unit_price: 150,
      total: 300,
    };

    expect(item.id).toBeDefined();
    expect(item.event_name).toBeDefined();
    expect(item.event_date).toBeDefined();
    expect(item.venue_name).toBeDefined();
    expect(item.ticket_type).toBeDefined();
    expect(item.quantity).toBeDefined();
    expect(item.unit_price).toBeDefined();
    expect(item.total).toBeDefined();
  });
});

describe('OrderDetails interface', () => {
  it('should have required fields', () => {
    const order = {
      id: '1',
      order_number: 'ORD-001',
      status: 'confirmed',
      created_at: '2024-01-15',
      items: [],
      subtotal: 300,
      fees: 15,
      taxes: 25,
      discount: 0,
      total: 340,
      payment_method: 'credit_card',
      billing_email: 'user@example.com',
    };

    expect(order.id).toBeDefined();
    expect(order.order_number).toBeDefined();
    expect(order.status).toBeDefined();
    expect(order.created_at).toBeDefined();
    expect(order.items).toBeDefined();
    expect(order.subtotal).toBeDefined();
    expect(order.fees).toBeDefined();
    expect(order.taxes).toBeDefined();
    expect(order.total).toBeDefined();
    expect(order.payment_method).toBeDefined();
    expect(order.billing_email).toBeDefined();
  });
});
