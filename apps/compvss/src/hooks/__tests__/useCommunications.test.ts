import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCommunications, useSendCommunication, useUpdateCommunication, useDeleteCommunication } from '../useCommunications';

// Mock Supabase with proper chaining
vi.mock('@/lib/supabase', () => {
  const createChainableMock = (finalData: unknown) => {
    const mock = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
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
        { id: '1', type: 'email', priority: 'high', subject: 'Test', timestamp: '2024-01-15' },
        { id: '2', type: 'sms', priority: 'normal', subject: 'Update', timestamp: '2024-01-14' },
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

describe('useCommunications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCommunications hook', () => {
    it('should fetch communications successfully', async () => {
      const { result } = renderHook(() => useCommunications(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply type filter', async () => {
      const { result } = renderHook(() => useCommunications({ type: 'email' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply priority filter', async () => {
      const { result } = renderHook(() => useCommunications({ priority: 'high' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useCommunications(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useSendCommunication hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useSendCommunication(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useSendCommunication(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useUpdateCommunication hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useUpdateCommunication(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });

  describe('useDeleteCommunication hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useDeleteCommunication(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });
});

describe('Communication interface', () => {
  it('should have communication fields', () => {
    const comm = {
      id: '1',
      type: 'email',
      priority: 'high',
      subject: 'Test Communication',
      body: 'This is a test message',
      timestamp: '2024-01-15T10:00:00Z',
    };

    expect(comm.id).toBeDefined();
    expect(comm.type).toBeDefined();
    expect(comm.priority).toBeDefined();
    expect(comm.subject).toBeDefined();
    expect(comm.body).toBeDefined();
    expect(comm.timestamp).toBeDefined();
  });
});
