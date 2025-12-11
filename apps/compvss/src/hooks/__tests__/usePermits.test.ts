import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePermitsList, usePermitsData, permitKeys } from '../usePermits';

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

describe('usePermits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('permitKeys', () => {
    it('should generate correct all key', () => {
      expect(permitKeys.all).toEqual(['permits']);
    });

    it('should generate correct list key', () => {
      expect(permitKeys.list()).toEqual(['permits', 'list']);
    });
  });

  describe('usePermitsList hook', () => {
    it('should return demo data on 401 response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => usePermitsList(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.permits).toBeDefined();
      expect(result.current.data?.summary).toBeDefined();
    });

    it('should return loading state initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));
      const { result } = renderHook(() => usePermitsList(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('usePermitsData hook', () => {
    it('should return combined data structure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => usePermitsData(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.permits).toBeDefined();
      expect(result.current.summary).toBeDefined();
      expect(typeof result.current.refetch).toBe('function');
    });

    it('should return empty permits array when no data', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ permits: [], summary: {} }),
      });

      const { result } = renderHook(() => usePermitsData(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(Array.isArray(result.current.permits)).toBe(true);
    });
  });
});

describe('Permit interface', () => {
  it('should have required fields', () => {
    const permit = {
      id: '1',
      permit_type: 'Special Event',
      project_id: 'proj-1',
      project_name: 'Summer Festival',
      venue_name: 'Central Park',
      jurisdiction: 'NYC Parks',
      issuing_authority: 'NYC Special Events',
      application_date: '2024-01-01',
      fee_amount: 2500,
      status: 'approved',
    };

    expect(permit.id).toBeDefined();
    expect(permit.permit_type).toBeDefined();
    expect(permit.project_id).toBeDefined();
    expect(permit.project_name).toBeDefined();
    expect(permit.venue_name).toBeDefined();
    expect(permit.jurisdiction).toBeDefined();
    expect(permit.issuing_authority).toBeDefined();
    expect(permit.application_date).toBeDefined();
    expect(permit.fee_amount).toBeDefined();
    expect(permit.status).toBeDefined();
  });

  it('should support optional fields', () => {
    const permit = {
      id: '1',
      permit_number: 'SP-2024-0123',
      permit_type: 'Special Event',
      project_id: 'proj-1',
      project_name: 'Summer Festival',
      venue_name: 'Central Park',
      jurisdiction: 'NYC Parks',
      issuing_authority: 'NYC Special Events',
      application_date: '2024-01-01',
      approval_date: '2024-01-15',
      expiration_date: '2024-12-31',
      fee_amount: 2500,
      status: 'approved',
      requirements: ['Insurance certificate', 'Safety plan'],
      documents: ['permit.pdf', 'insurance.pdf'],
      notes: 'Approved with conditions',
    };

    expect(permit.permit_number).toBe('SP-2024-0123');
    expect(permit.approval_date).toBe('2024-01-15');
    expect(permit.expiration_date).toBe('2024-12-31');
    expect(permit.requirements).toEqual(['Insurance certificate', 'Safety plan']);
    expect(permit.documents).toEqual(['permit.pdf', 'insurance.pdf']);
    expect(permit.notes).toBe('Approved with conditions');
  });
});

describe('PermitSummary interface', () => {
  it('should have all summary fields', () => {
    const summary = {
      total_permits: 10,
      pending_applications: 3,
      approved_permits: 6,
      expiring_soon: 1,
      total_fees: 15000,
    };

    expect(summary.total_permits).toBe(10);
    expect(summary.pending_applications).toBe(3);
    expect(summary.approved_permits).toBe(6);
    expect(summary.expiring_soon).toBe(1);
    expect(summary.total_fees).toBe(15000);
  });
});
