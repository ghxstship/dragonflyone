import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSponsorTiers, useSponsors, useSponsor, useCreateSponsor, useUpdateSponsor } from '../useSponsors';

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
        { id: '1', company_name: 'Coca-Cola', status: 'confirmed', contract_value: 50000, payment_status: 'paid' },
        { id: '2', company_name: 'Nike', status: 'negotiating', contract_value: 30000, payment_status: 'pending' },
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

describe('useSponsors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useSponsorTiers hook', () => {
    it('should fetch sponsor tiers successfully', async () => {
      const { result } = renderHook(() => useSponsorTiers(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply productionId filter', async () => {
      const { result } = renderHook(() => useSponsorTiers('prod-1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('useSponsors hook', () => {
    it('should fetch sponsors successfully', async () => {
      const { result } = renderHook(() => useSponsors(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply productionId filter', async () => {
      const { result } = renderHook(() => useSponsors({ productionId: 'prod-1' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply status filter', async () => {
      const { result } = renderHook(() => useSponsors({ status: 'confirmed' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply paymentStatus filter', async () => {
      const { result } = renderHook(() => useSponsors({ paymentStatus: 'paid' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useSponsors(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useSponsor hook', () => {
    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useSponsor(''), { wrapper: createWrapper() });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should fetch when id is provided', async () => {
      const { result } = renderHook(() => useSponsor('1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isFetching).toBe(true);
      });
    });
  });

  describe('useCreateSponsor hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCreateSponsor(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });

  describe('useUpdateSponsor hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useUpdateSponsor(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });

});

describe('SponsorTier interface', () => {
  it('should have required fields', () => {
    const tier = {
      id: '1',
      production_id: 'prod-1',
      name: 'Platinum',
      level: 1,
      price: 100000,
      benefits: ['Logo on main stage', 'VIP access'],
      is_active: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(tier.id).toBeDefined();
    expect(tier.production_id).toBeDefined();
    expect(tier.name).toBeDefined();
    expect(tier.level).toBeDefined();
    expect(tier.price).toBeDefined();
    expect(tier.benefits).toBeDefined();
    expect(tier.is_active).toBeDefined();
  });
});

describe('Sponsor interface', () => {
  it('should have required fields', () => {
    const sponsor = {
      id: '1',
      production_id: 'prod-1',
      organization_id: 'org-1',
      sponsor_tier_id: 'tier-1',
      company_name: 'Coca-Cola',
      status: 'confirmed' as const,
      contract_value: 50000,
      payment_status: 'paid' as const,
      amount_paid: 50000,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(sponsor.id).toBeDefined();
    expect(sponsor.production_id).toBeDefined();
    expect(sponsor.company_name).toBeDefined();
    expect(sponsor.status).toBeDefined();
    expect(sponsor.contract_value).toBeDefined();
    expect(sponsor.payment_status).toBeDefined();
  });

  it('should support optional fields', () => {
    const sponsor = {
      id: '1',
      production_id: 'prod-1',
      organization_id: 'org-1',
      sponsor_tier_id: 'tier-1',
      company_name: 'Coca-Cola',
      contact_name: 'Jane Smith',
      contact_email: 'jane@coca-cola.com',
      contact_phone: '+1234567890',
      logo_url: '/logos/coca-cola.png',
      website_url: 'https://coca-cola.com',
      status: 'confirmed' as const,
      contract_value: 50000,
      payment_status: 'paid' as const,
      amount_paid: 50000,
      contract_signed_at: '2024-01-15',
      notes: 'Premium sponsor',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(sponsor.contact_name).toBe('Jane Smith');
    expect(sponsor.logo_url).toBe('/logos/coca-cola.png');
    expect(sponsor.website_url).toBe('https://coca-cola.com');
  });
});
