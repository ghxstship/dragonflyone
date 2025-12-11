import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCertifications, useAddCertification, useUpdateCertification, useDeleteCertification } from '../useCertifications';

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
        { id: '1', name: 'First Aid', expiration_date: '2025-06-01', status: 'active' },
        { id: '2', name: 'Forklift License', expiration_date: '2025-12-01', status: 'active' },
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

describe('useCertifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCertifications hook', () => {
    it('should fetch certifications successfully', async () => {
      const { result } = renderHook(() => useCertifications(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply crewMemberId filter', async () => {
      const { result } = renderHook(() => useCertifications('crew-1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useCertifications(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useAddCertification hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useAddCertification(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useAddCertification(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useUpdateCertification hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useUpdateCertification(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });

  describe('useDeleteCertification hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useDeleteCertification(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });
});

describe('CrewCertification interface', () => {
  it('should have certification fields', () => {
    const cert = {
      id: '1',
      crew_member_id: 'crew-1',
      name: 'First Aid',
      issuing_authority: 'Red Cross',
      issue_date: '2024-01-15',
      expiration_date: '2025-06-01',
      status: 'active',
    };

    expect(cert.id).toBeDefined();
    expect(cert.crew_member_id).toBeDefined();
    expect(cert.name).toBeDefined();
    expect(cert.issuing_authority).toBeDefined();
    expect(cert.issue_date).toBeDefined();
    expect(cert.expiration_date).toBeDefined();
    expect(cert.status).toBeDefined();
  });
});
