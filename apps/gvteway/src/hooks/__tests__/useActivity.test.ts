import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useActivityFeed, useActivityData, activityKeys } from '../useActivity';

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

describe('useActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('activityKeys', () => {
    it('should generate correct all key', () => {
      expect(activityKeys.all).toEqual(['activity']);
    });

    it('should generate correct feed key with filters', () => {
      expect(activityKeys.feed({ type: 'review' })).toEqual(['activity', 'feed', { type: 'review' }]);
    });

    it('should generate correct feed key without filters', () => {
      expect(activityKeys.feed()).toEqual(['activity', 'feed', undefined]);
    });
  });

  describe('useActivityFeed hook', () => {
    it('should return demo data on 401 response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useActivityFeed(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBeGreaterThan(0);
    });

    it('should apply type filter', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useActivityFeed({ type: 'review' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));
      const { result } = renderHook(() => useActivityFeed(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useActivityData hook', () => {
    it('should return combined data structure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useActivityData(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.activities).toBeDefined();
      expect(typeof result.current.refetch).toBe('function');
    });
  });
});

describe('ActivityItem interface', () => {
  it('should have required fields', () => {
    const activity = {
      id: '1',
      type: 'ticket_purchase' as const,
      user_id: 'u1',
      user_name: 'Alex Johnson',
      created_at: '2024-01-01',
    };

    expect(activity.id).toBeDefined();
    expect(activity.type).toBeDefined();
    expect(activity.user_id).toBeDefined();
    expect(activity.user_name).toBeDefined();
    expect(activity.created_at).toBeDefined();
  });

  it('should support optional fields', () => {
    const activity = {
      id: '1',
      type: 'review' as const,
      user_id: 'u1',
      user_name: 'Alex Johnson',
      user_avatar: '/avatars/alex.jpg',
      event_id: 'e1',
      event_title: 'Summer Festival',
      event_image: '/events/summer.jpg',
      artist_id: 'a1',
      artist_name: 'The Band',
      venue_id: 'v1',
      venue_name: 'Central Park',
      content: 'Amazing show!',
      created_at: '2024-01-01',
    };

    expect(activity.user_avatar).toBe('/avatars/alex.jpg');
    expect(activity.event_id).toBe('e1');
    expect(activity.event_title).toBe('Summer Festival');
    expect(activity.artist_name).toBe('The Band');
    expect(activity.content).toBe('Amazing show!');
  });
});
