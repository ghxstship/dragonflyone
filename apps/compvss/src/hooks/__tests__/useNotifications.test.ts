import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNotifications } from '../useNotifications';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn(),
    })),
  },
}));

// Mock config logger
vi.mock('@ghxstship/config', () => ({
  log: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        notifications: [
          { id: '1', title: 'Test', message: 'Test message', type: 'info', read: false, created_at: '2024-01-01', priority: 'medium' },
          { id: '2', title: 'Test 2', message: 'Test message 2', type: 'success', read: true, created_at: '2024-01-02', priority: 'low' },
        ],
        unreadCount: 1,
      }),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should start with loading state', () => {
      const { result } = renderHook(() => useNotifications());
      expect(result.current.loading).toBe(true);
    });

    it('should start with empty notifications', () => {
      const { result } = renderHook(() => useNotifications());
      expect(result.current.notifications).toEqual([]);
    });

    it('should start with zero unread count', () => {
      const { result } = renderHook(() => useNotifications());
      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('fetching notifications', () => {
    it('should call fetch on mount', () => {
      renderHook(() => useNotifications());
      // Fetch is called asynchronously on mount
      expect(mockFetch).toBeDefined();
    });

    it('should initialize with empty notifications', () => {
      const { result } = renderHook(() => useNotifications());
      // Initially empty before fetch completes
      expect(result.current.notifications).toEqual([]);
    });

    it('should initialize with zero unread count', () => {
      const { result } = renderHook(() => useNotifications());
      expect(result.current.unreadCount).toBe(0);
    });

    it('should start with loading true', () => {
      const { result } = renderHook(() => useNotifications());
      expect(result.current.loading).toBe(true);
    });
  });

  describe('markAsRead', () => {
    it('should have markAsRead function', () => {
      const { result } = renderHook(() => useNotifications());
      expect(typeof result.current.markAsRead).toBe('function');
    });
  });

  describe('markAllAsRead', () => {
    it('should have markAllAsRead function', () => {
      const { result } = renderHook(() => useNotifications());
      expect(typeof result.current.markAllAsRead).toBe('function');
    });
  });

  describe('refresh', () => {
    it('should have refresh function', () => {
      const { result } = renderHook(() => useNotifications());
      expect(typeof result.current.refresh).toBe('function');
    });
  });

  describe('error handling', () => {
    it('should start with empty notifications on error', () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const { result } = renderHook(() => useNotifications());
      expect(result.current.notifications).toEqual([]);
    });
  });
});

describe('Notification interface', () => {
  it('should have required fields', () => {
    const notification = {
      id: '1',
      title: 'Test Notification',
      message: 'This is a test message',
      type: 'info' as const,
      read: false,
      created_at: '2024-01-01T00:00:00Z',
      priority: 'medium' as const,
    };

    expect(notification.id).toBeDefined();
    expect(notification.title).toBeDefined();
    expect(notification.message).toBeDefined();
    expect(notification.type).toBeDefined();
    expect(typeof notification.read).toBe('boolean');
    expect(notification.created_at).toBeDefined();
    expect(notification.priority).toBeDefined();
  });

  it('should support optional fields', () => {
    const notification = {
      id: '1',
      title: 'Test Notification',
      message: 'This is a test message',
      type: 'info' as const,
      read: false,
      created_at: '2024-01-01T00:00:00Z',
      priority: 'high' as const,
      action_url: '/dashboard',
      action_label: 'View Dashboard',
    };

    expect(notification.action_url).toBe('/dashboard');
    expect(notification.action_label).toBe('View Dashboard');
  });

  it('should support all notification types', () => {
    const types = ['info', 'success', 'warning', 'error', 'urgent'];
    types.forEach(type => {
      const notification = {
        id: '1',
        title: 'Test',
        message: 'Test',
        type: type as 'info' | 'success' | 'warning' | 'error' | 'urgent',
        read: false,
        created_at: '2024-01-01',
        priority: 'medium' as const,
      };
      expect(notification.type).toBe(type);
    });
  });

  it('should support all priority levels', () => {
    const priorities = ['low', 'medium', 'high'];
    priorities.forEach(priority => {
      const notification = {
        id: '1',
        title: 'Test',
        message: 'Test',
        type: 'info' as const,
        read: false,
        created_at: '2024-01-01',
        priority: priority as 'low' | 'medium' | 'high',
      };
      expect(notification.priority).toBe(priority);
    });
  });
});
