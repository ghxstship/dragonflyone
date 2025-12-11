import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuditLogs, useAuditData, auditKeys } from '../useAudit';

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

describe('useAudit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('auditKeys', () => {
    it('should generate correct all key', () => {
      expect(auditKeys.all).toEqual(['audit']);
    });

    it('should generate correct logs key', () => {
      expect(auditKeys.logs()).toEqual(['audit', 'logs']);
    });
  });

  describe('useAuditLogs hook', () => {
    it('should return demo data on 401 response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useAuditLogs(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.logs).toBeDefined();
      expect(result.current.data?.summary).toBeDefined();
    });

    it('should return loading state initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));
      const { result } = renderHook(() => useAuditLogs(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useAuditData hook', () => {
    it('should return combined data structure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useAuditData(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.logs).toBeDefined();
      expect(result.current.summary).toBeDefined();
      expect(typeof result.current.refetch).toBe('function');
      expect(typeof result.current.createLog).toBe('function');
    });
  });
});

describe('AuditLog interface', () => {
  it('should have required fields', () => {
    const log = {
      id: '1',
      timestamp: '2024-01-15T10:00:00Z',
      action: 'login',
      resource_type: 'session',
      resource_id: 'sess-001',
      created_at: '2024-01-15T10:00:00Z',
    };

    expect(log.id).toBeDefined();
    expect(log.timestamp).toBeDefined();
    expect(log.action).toBeDefined();
    expect(log.resource_type).toBeDefined();
    expect(log.resource_id).toBeDefined();
    expect(log.created_at).toBeDefined();
  });

  it('should support optional fields', () => {
    const log = {
      id: '1',
      timestamp: '2024-01-15T10:00:00Z',
      user_id: 'user-1',
      user_email: 'admin@example.com',
      user: { id: 'user-1', email: 'admin@example.com', full_name: 'Admin User' },
      action: 'update',
      resource_type: 'project',
      resource_id: 'proj-001',
      details: 'Updated budget',
      ip_address: '192.168.1.1',
      created_at: '2024-01-15T10:00:00Z',
    };

    expect(log.user_id).toBe('user-1');
    expect(log.user_email).toBe('admin@example.com');
    expect(log.user?.full_name).toBe('Admin User');
    expect(log.details).toBe('Updated budget');
    expect(log.ip_address).toBe('192.168.1.1');
  });
});

describe('AuditSummary interface', () => {
  it('should have all summary fields', () => {
    const summary = {
      total: 100,
      today: 25,
      active_users: 10,
      failed_attempts: 2,
    };

    expect(summary.total).toBe(100);
    expect(summary.today).toBe(25);
    expect(summary.active_users).toBe(10);
    expect(summary.failed_attempts).toBe(2);
  });
});
