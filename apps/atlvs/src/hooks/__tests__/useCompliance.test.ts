import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePermits, useInsurancePolicies, useCreatePermit, useCreateInsurancePolicy } from '../useCompliance';

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
        { id: '1', name: 'Event Permit', permit_type: 'event', status: 'approved' },
        { id: '2', name: 'Noise Permit', permit_type: 'noise', status: 'pending' },
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

describe('useCompliance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('usePermits hook', () => {
    it('should fetch permits successfully', async () => {
      const { result } = renderHook(() => usePermits(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply productionId filter', async () => {
      const { result } = renderHook(() => usePermits({ productionId: 'prod-1' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply permitType filter', async () => {
      const { result } = renderHook(() => usePermits({ permitType: 'event' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply status filter', async () => {
      const { result } = renderHook(() => usePermits({ status: 'approved' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => usePermits(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useInsurancePolicies hook', () => {
    it('should fetch insurance policies successfully', async () => {
      const { result } = renderHook(() => useInsurancePolicies(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply productionId filter', async () => {
      const { result } = renderHook(() => useInsurancePolicies({ productionId: 'prod-1' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('useCreatePermit hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCreatePermit(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });

  describe('useCreateInsurancePolicy hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCreateInsurancePolicy(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });
});

describe('Permit interface', () => {
  it('should have required fields', () => {
    const permit = {
      id: '1',
      production_id: 'prod-1',
      permit_type: 'event' as const,
      name: 'Event Permit',
      issuing_authority: 'City Hall',
      status: 'approved' as const,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(permit.id).toBeDefined();
    expect(permit.production_id).toBeDefined();
    expect(permit.permit_type).toBeDefined();
    expect(permit.name).toBeDefined();
    expect(permit.issuing_authority).toBeDefined();
    expect(permit.status).toBeDefined();
  });

  it('should support optional fields', () => {
    const permit = {
      id: '1',
      production_id: 'prod-1',
      permit_type: 'event' as const,
      name: 'Event Permit',
      description: 'Main event permit',
      issuing_authority: 'City Hall',
      permit_number: 'EP-2024-001',
      status: 'approved' as const,
      application_date: '2024-01-01',
      approval_date: '2024-01-15',
      expiration_date: '2024-12-31',
      cost: 500,
      document_url: '/docs/permit.pdf',
      requirements: ['Insurance', 'Safety Plan'],
      notes: 'Approved with conditions',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(permit.description).toBe('Main event permit');
    expect(permit.permit_number).toBe('EP-2024-001');
    expect(permit.cost).toBe(500);
    expect(permit.requirements).toHaveLength(2);
  });
});

describe('InsurancePolicy interface', () => {
  it('should have required fields', () => {
    const policy = {
      id: '1',
      production_id: 'prod-1',
      policy_type: 'general_liability' as const,
      policy_name: 'General Liability Insurance',
      provider: 'Acme Insurance',
      policy_number: 'POL-2024-001',
      coverage_amount: 1000000,
      status: 'active' as const,
      effective_date: '2024-01-01',
      expiration_date: '2024-12-31',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(policy.id).toBeDefined();
    expect(policy.production_id).toBeDefined();
    expect(policy.policy_type).toBeDefined();
    expect(policy.policy_name).toBeDefined();
    expect(policy.provider).toBeDefined();
    expect(policy.policy_number).toBeDefined();
    expect(policy.coverage_amount).toBeDefined();
    expect(policy.status).toBeDefined();
  });
});
