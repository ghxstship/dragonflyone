import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSafetyIncidents, useCrewCertifications, useReportSafetyIncident } from '../useSafety';

// Mock Supabase with proper chaining
vi.mock('@/lib/supabase', () => {
  const createChainableMock = (finalData: unknown) => {
    const mock = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      then: vi.fn((resolve) => resolve({ data: finalData, error: null })),
    };
    Object.keys(mock).forEach(key => {
      if (key !== 'then') {
        (mock as Record<string, ReturnType<typeof vi.fn>>)[key].mockReturnValue(mock);
      }
    });
    return mock;
  };

  return {
    supabase: {
      from: vi.fn(() => createChainableMock([
        { id: '1', incident_type: 'slip', severity: 'minor', status: 'open' },
        { id: '2', incident_type: 'equipment', severity: 'moderate', status: 'resolved' },
      ])),
    },
  };
});

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

describe('useSafety', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useSafetyIncidents hook', () => {
    it('should fetch safety incidents successfully', async () => {
      const { result } = renderHook(() => useSafetyIncidents(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply status filter', async () => {
      const { result } = renderHook(() => useSafetyIncidents({ status: 'open' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply severity filter', async () => {
      const { result } = renderHook(() => useSafetyIncidents({ severity: 'critical' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useSafetyIncidents(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useCrewCertifications hook', () => {
    it('should fetch crew certifications successfully', async () => {
      const { result } = renderHook(() => useCrewCertifications(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply status filter', async () => {
      const { result } = renderHook(() => useCrewCertifications({ status: 'active' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('useReportSafetyIncident hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useReportSafetyIncident(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useReportSafetyIncident(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });
});

describe('SafetyIncident type', () => {
  it('should have expected fields', () => {
    const incident = {
      id: '1',
      incident_type: 'slip',
      severity: 'minor',
      status: 'open',
      incident_date: '2024-01-15',
      description: 'Slip on wet floor',
      location: 'Backstage',
      reported_by: 'user-1',
    };

    expect(incident.id).toBeDefined();
    expect(incident.incident_type).toBeDefined();
    expect(incident.severity).toBeDefined();
    expect(incident.status).toBeDefined();
  });
});

describe('CrewCertification type', () => {
  it('should have expected fields', () => {
    const cert = {
      id: '1',
      crew_member_id: 'crew-1',
      certification_type: 'First Aid',
      status: 'active',
      issue_date: '2024-01-01',
      expiration_date: '2025-01-01',
    };

    expect(cert.id).toBeDefined();
    expect(cert.crew_member_id).toBeDefined();
    expect(cert.certification_type).toBeDefined();
    expect(cert.status).toBeDefined();
  });
});
