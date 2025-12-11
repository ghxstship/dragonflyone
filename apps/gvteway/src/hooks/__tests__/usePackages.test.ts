import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePackagesList, usePackagesSummary, usePackagesData, packagesKeys } from '../usePackages';

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

describe('usePackages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('packagesKeys', () => {
    it('should generate correct all key', () => {
      expect(packagesKeys.all).toEqual(['packages']);
    });

    it('should generate correct list key with filters', () => {
      expect(packagesKeys.list({ search: 'VIP' })).toEqual(['packages', 'list', { search: 'VIP' }]);
    });

    it('should generate correct summary key', () => {
      expect(packagesKeys.summary()).toEqual(['packages', 'summary']);
    });
  });

  describe('usePackagesList hook', () => {
    it('should return demo data on 401 response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => usePackagesList(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBeGreaterThan(0);
    });

    it('should apply search filter', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => usePackagesList({ search: 'VIP' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));
      const { result } = renderHook(() => usePackagesList(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('usePackagesSummary hook', () => {
    it('should return demo summary on 401 response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => usePackagesSummary(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.total_packages).toBeDefined();
    });
  });

  describe('usePackagesData hook', () => {
    it('should return combined data structure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => usePackagesData(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.packages).toBeDefined();
      expect(result.current.summary).toBeDefined();
      expect(typeof result.current.refetch).toBe('function');
    });
  });
});

describe('EventPackage interface', () => {
  it('should have required fields', () => {
    const pkg = {
      id: '1',
      name: 'VIP Package',
      event_id: 'event-1',
      event_name: 'Summer Festival',
      event_date: '2024-07-15',
      venue_name: 'Central Park',
      description: 'Ultimate VIP experience',
      includes: ['Backstage access'],
      ticket_type: 'VIP',
      transportation_included: true,
      meet_greet: true,
      vip_access: true,
      original_price: 500,
      package_price: 399,
      savings: 20,
      availability: 50,
      status: 'available',
    };

    expect(pkg.id).toBeDefined();
    expect(pkg.name).toBeDefined();
    expect(pkg.event_id).toBeDefined();
    expect(pkg.package_price).toBeDefined();
    expect(pkg.status).toBeDefined();
  });

  it('should support optional fields', () => {
    const pkg = {
      id: '1',
      name: 'VIP Package',
      event_id: 'event-1',
      event_name: 'Summer Festival',
      event_date: '2024-07-15',
      venue_name: 'Central Park',
      description: 'Ultimate VIP experience',
      includes: ['Backstage access', 'Meet & Greet'],
      ticket_type: 'VIP',
      hotel_name: 'Grand Hotel',
      hotel_nights: 2,
      transportation_included: true,
      meet_greet: true,
      vip_access: true,
      original_price: 500,
      package_price: 399,
      savings: 20,
      availability: 50,
      status: 'available',
    };

    expect(pkg.hotel_name).toBe('Grand Hotel');
    expect(pkg.hotel_nights).toBe(2);
  });
});

describe('PackageSummary interface', () => {
  it('should have all summary fields', () => {
    const summary = {
      total_packages: 45,
      vip_packages: 12,
      travel_packages: 18,
      average_savings: 18,
    };

    expect(summary.total_packages).toBe(45);
    expect(summary.vip_packages).toBe(12);
    expect(summary.travel_packages).toBe(18);
    expect(summary.average_savings).toBe(18);
  });
});
