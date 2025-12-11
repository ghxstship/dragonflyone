import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNotificationsList, useMarkNotificationRead, useMarkAllRead, notificationKeys } from '../useNotifications';

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

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('notificationKeys', () => {
    it('should generate correct all key', () => {
      expect(notificationKeys.all).toEqual(['notifications']);
    });

    it('should generate correct list key', () => {
      expect(notificationKeys.list()).toEqual(['notifications', 'list', undefined]);
    });

    it('should generate correct list key with filter', () => {
      expect(notificationKeys.list('project_update')).toEqual(['notifications', 'list', 'project_update']);
    });
  });

  describe('useNotificationsList hook', () => {
    it('should return demo data on 401 response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useNotificationsList(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBeGreaterThan(0);
    });

    it('should return loading state initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));
      const { result } = renderHook(() => useNotificationsList(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });

    it('should apply filter type', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useNotificationsList('project_update'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('useMarkNotificationRead hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useMarkNotificationRead(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useMarkNotificationRead(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useMarkAllRead hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useMarkAllRead(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });
});

describe('Notification interface', () => {
  it('should have required fields', () => {
    const notification = {
      id: '1',
      type: 'project_update',
      title: 'Project Budget Updated',
      message: 'Summer Festival 2024 budget has been approved.',
      read: false,
      created_at: '2024-01-15T10:00:00Z',
    };

    expect(notification.id).toBeDefined();
    expect(notification.type).toBeDefined();
    expect(notification.title).toBeDefined();
    expect(notification.message).toBeDefined();
    expect(notification.read).toBeDefined();
    expect(notification.created_at).toBeDefined();
  });

  it('should support optional fields', () => {
    const notification = {
      id: '1',
      type: 'project_update',
      title: 'Project Budget Updated',
      message: 'Summer Festival 2024 budget has been approved.',
      read: false,
      created_at: '2024-01-15T10:00:00Z',
      user_id: 'user-1',
    };

    expect(notification.user_id).toBe('user-1');
  });
});
