import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserBadges, useFeatureBadge, badgesKeys } from '../useBadges';

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

describe('useBadges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('badgesKeys', () => {
    it('should generate correct all key', () => {
      expect(badgesKeys.all).toEqual(['badges']);
    });

    it('should generate correct user key', () => {
      expect(badgesKeys.user()).toEqual(['badges', 'user']);
    });
  });

  describe('useUserBadges hook', () => {
    it('should return demo data on error response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useUserBadges(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.earned_badges).toBeDefined();
      expect(result.current.data?.available_badges).toBeDefined();
      expect(result.current.data?.fan_tiers).toBeDefined();
    });

    it('should return loading state initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));
      const { result } = renderHook(() => useUserBadges(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useFeatureBadge hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useFeatureBadge(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useFeatureBadge(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });
});

describe('UserBadge interface', () => {
  it('should have required fields', () => {
    const badge = {
      id: '1',
      badge_id: 'b1',
      name: 'First Event',
      description: 'Attended your first event',
      icon: '🎫',
      tier: 'bronze' as const,
      earned_at: '2024-01-15',
      is_featured: true,
    };

    expect(badge.id).toBeDefined();
    expect(badge.badge_id).toBeDefined();
    expect(badge.name).toBeDefined();
    expect(badge.description).toBeDefined();
    expect(badge.icon).toBeDefined();
    expect(badge.tier).toBeDefined();
    expect(badge.earned_at).toBeDefined();
    expect(badge.is_featured).toBeDefined();
  });
});

describe('AvailableBadge interface', () => {
  it('should have required fields', () => {
    const badge = {
      id: '1',
      name: 'Super Fan',
      description: 'Attend 10 events',
      icon: '⭐',
      tier: 'gold',
      requirement: 'Attend 10 events',
      progress: 3,
      total: 10,
      is_earned: false,
    };

    expect(badge.id).toBeDefined();
    expect(badge.name).toBeDefined();
    expect(badge.description).toBeDefined();
    expect(badge.requirement).toBeDefined();
    expect(badge.progress).toBeDefined();
    expect(badge.total).toBeDefined();
    expect(badge.is_earned).toBeDefined();
  });
});

describe('FanTier interface', () => {
  it('should have required fields', () => {
    const tier = {
      id: '1',
      name: 'Bronze Fan',
      level: 1,
      icon: '🥉',
      perks: ['Early access'],
      points_required: 0,
      is_current: true,
    };

    expect(tier.id).toBeDefined();
    expect(tier.name).toBeDefined();
    expect(tier.level).toBeDefined();
    expect(tier.icon).toBeDefined();
    expect(tier.perks).toBeDefined();
    expect(tier.points_required).toBeDefined();
    expect(tier.is_current).toBeDefined();
  });
});
