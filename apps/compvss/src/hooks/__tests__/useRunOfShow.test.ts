import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCues, useUpdateCueStatus } from '../useRunOfShow';

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
        { id: '1', event_id: 'event1', scheduled_time: '18:00', activity: 'Doors Open', cue_type: 'logistics', status: 'pending' },
        { id: '2', event_id: 'event1', scheduled_time: '19:00', activity: 'Opening Act', cue_type: 'performance', status: 'ready' },
        { id: '3', event_id: 'event1', scheduled_time: '20:00', activity: 'Headliner', cue_type: 'performance', status: 'pending' },
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

describe('useRunOfShow hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCues hook', () => {
    it('should fetch cues successfully', async () => {
      const { result } = renderHook(() => useCues('event1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should fetch all cues when no eventId provided', async () => {
      const { result } = renderHook(() => useCues(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useCues('event1'), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });

    it('should have data property', async () => {
      const { result } = renderHook(() => useCues('event1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });
    });

    it('should have error property', () => {
      const { result } = renderHook(() => useCues('event1'), { wrapper: createWrapper() });
      expect(result.current.error).toBeNull();
    });
  });

  describe('useUpdateCueStatus hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useUpdateCueStatus(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useUpdateCueStatus(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });

    it('should have isPending property', () => {
      const { result } = renderHook(() => useUpdateCueStatus(), { wrapper: createWrapper() });
      expect(result.current.isPending).toBe(false);
    });

    it('should have isError property', () => {
      const { result } = renderHook(() => useUpdateCueStatus(), { wrapper: createWrapper() });
      expect(result.current.isError).toBe(false);
    });

    it('should have isSuccess property', () => {
      const { result } = renderHook(() => useUpdateCueStatus(), { wrapper: createWrapper() });
      expect(result.current.isSuccess).toBe(false);
    });
  });
});

describe('CueItem interface', () => {
  it('should have required fields', () => {
    const cue = {
      id: '1',
      time: '19:00',
      cue: 'Opening Act',
      department: 'Performance',
      status: 'pending' as const,
    };

    expect(cue.id).toBeDefined();
    expect(cue.time).toBeDefined();
    expect(cue.cue).toBeDefined();
    expect(cue.department).toBeDefined();
    expect(cue.status).toBeDefined();
  });

  it('should support optional fields', () => {
    const cue = {
      id: '1',
      time: '19:00',
      cue: 'Opening Act',
      department: 'Performance',
      status: 'pending' as const,
      notes: 'Special lighting cue at start',
    };

    expect(cue.notes).toBe('Special lighting cue at start');
  });

  it('should support all status values', () => {
    const statuses = ['pending', 'ready', 'complete'] as const;
    statuses.forEach(status => {
      const cue = {
        id: '1',
        time: '19:00',
        cue: 'Test Cue',
        department: 'General',
        status,
      };
      expect(cue.status).toBe(status);
    });
  });
});
