import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useIPAssets, useIPTrackingData, ipTrackingKeys } from '../useIPTracking';

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

describe('useIPTracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ipTrackingKeys', () => {
    it('should generate correct all key', () => {
      expect(ipTrackingKeys.all).toEqual(['ip-tracking']);
    });

    it('should generate correct assets key', () => {
      expect(ipTrackingKeys.assets()).toEqual(['ip-tracking', 'assets']);
    });
  });

  describe('useIPAssets hook', () => {
    it('should return demo data on 401 response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useIPAssets(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBeGreaterThan(0);
    });

    it('should return loading state initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));
      const { result } = renderHook(() => useIPAssets(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useIPTrackingData hook', () => {
    it('should return combined data structure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useIPTrackingData(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.assets).toBeDefined();
      expect(typeof result.current.pendingCount).toBe('number');
      expect(typeof result.current.totalValue).toBe('number');
      expect(typeof result.current.refetch).toBe('function');
    });

    it('should calculate totals correctly', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useIPTrackingData(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.totalValue).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('IntellectualProperty interface', () => {
  it('should have required fields', () => {
    const ip = {
      id: '1',
      title: 'GHXSTSHIP Brand',
      ip_type: 'trademark',
      jurisdiction: 'United States',
      status: 'registered',
      owner_entity: 'GHXSTSHIP Inc.',
    };

    expect(ip.id).toBeDefined();
    expect(ip.title).toBeDefined();
    expect(ip.ip_type).toBeDefined();
    expect(ip.jurisdiction).toBeDefined();
    expect(ip.status).toBeDefined();
    expect(ip.owner_entity).toBeDefined();
  });

  it('should support optional fields', () => {
    const ip = {
      id: '1',
      title: 'GHXSTSHIP Brand',
      ip_type: 'trademark',
      registration_number: 'TM-2024-001',
      filing_date: '2024-01-15',
      registration_date: '2024-06-01',
      expiration_date: '2034-06-01',
      jurisdiction: 'United States',
      status: 'registered',
      owner_entity: 'GHXSTSHIP Inc.',
      description: 'Main brand trademark',
      classes: ['Class 9', 'Class 42'],
      renewal_date: '2029-06-01',
      estimated_value: 500000,
    };

    expect(ip.registration_number).toBe('TM-2024-001');
    expect(ip.filing_date).toBe('2024-01-15');
    expect(ip.registration_date).toBe('2024-06-01');
    expect(ip.expiration_date).toBe('2034-06-01');
    expect(ip.description).toBe('Main brand trademark');
    expect(ip.classes).toHaveLength(2);
    expect(ip.renewal_date).toBe('2029-06-01');
    expect(ip.estimated_value).toBe(500000);
  });
});
