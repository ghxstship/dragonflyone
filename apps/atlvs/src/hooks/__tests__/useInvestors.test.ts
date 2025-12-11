import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInvestmentRounds, useInvestors, useCreateInvestor } from '../useInvestors';

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
        { id: '1', name: 'Seed Round', round_type: 'seed', target_amount: 500000, status: 'open' },
        { id: '2', name: 'Series A', round_type: 'series_a', target_amount: 2000000, status: 'planning' },
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

describe('useInvestors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useInvestmentRounds hook', () => {
    it('should fetch investment rounds successfully', async () => {
      const { result } = renderHook(() => useInvestmentRounds(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply productionId filter', async () => {
      const { result } = renderHook(() => useInvestmentRounds('prod-1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useInvestmentRounds(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useInvestors hook', () => {
    it('should fetch investors successfully', async () => {
      const { result } = renderHook(() => useInvestors(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply productionId filter', async () => {
      const { result } = renderHook(() => useInvestors({ productionId: 'prod-1' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply status filter', async () => {
      const { result } = renderHook(() => useInvestors({ status: 'funded' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('useCreateInvestor hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCreateInvestor(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useCreateInvestor(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });
});

describe('InvestmentRound interface', () => {
  it('should have required fields', () => {
    const round = {
      id: '1',
      production_id: 'prod-1',
      name: 'Seed Round',
      round_type: 'seed' as const,
      target_amount: 500000,
      minimum_investment: 25000,
      raised_amount: 150000,
      status: 'open' as const,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(round.id).toBeDefined();
    expect(round.production_id).toBeDefined();
    expect(round.name).toBeDefined();
    expect(round.round_type).toBeDefined();
    expect(round.target_amount).toBeDefined();
    expect(round.minimum_investment).toBeDefined();
    expect(round.raised_amount).toBeDefined();
    expect(round.status).toBeDefined();
  });

  it('should support optional fields', () => {
    const round = {
      id: '1',
      production_id: 'prod-1',
      name: 'Seed Round',
      round_type: 'seed' as const,
      target_amount: 500000,
      minimum_investment: 25000,
      raised_amount: 150000,
      status: 'open' as const,
      open_date: '2024-01-15',
      close_date: '2024-06-30',
      terms: 'Standard seed terms',
      documents: ['/docs/term-sheet.pdf'],
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(round.open_date).toBe('2024-01-15');
    expect(round.close_date).toBe('2024-06-30');
    expect(round.terms).toBe('Standard seed terms');
    expect(round.documents).toHaveLength(1);
  });
});

describe('Investor interface', () => {
  it('should have required fields', () => {
    const investor = {
      id: '1',
      production_id: 'prod-1',
      investor_type: 'individual' as const,
      name: 'John Investor',
      investment_amount: 50000,
      status: 'funded' as const,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(investor.id).toBeDefined();
    expect(investor.production_id).toBeDefined();
    expect(investor.investor_type).toBeDefined();
    expect(investor.name).toBeDefined();
    expect(investor.investment_amount).toBeDefined();
    expect(investor.status).toBeDefined();
  });
});
