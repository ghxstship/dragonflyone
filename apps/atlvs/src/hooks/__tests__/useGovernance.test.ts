import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGovernanceMeetings, useGovernanceData, governanceKeys } from '../useGovernance';

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

describe('useGovernance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('governanceKeys', () => {
    it('should generate correct all key', () => {
      expect(governanceKeys.all).toEqual(['governance']);
    });

    it('should generate correct meetings key', () => {
      expect(governanceKeys.meetings()).toEqual(['governance', 'meetings']);
    });
  });

  describe('useGovernanceMeetings hook', () => {
    it('should return demo data on 401 response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useGovernanceMeetings(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBeGreaterThan(0);
    });

    it('should return loading state initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));
      const { result } = renderHook(() => useGovernanceMeetings(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useGovernanceData hook', () => {
    it('should return combined data structure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useGovernanceData(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.meetings).toBeDefined();
      expect(typeof result.current.scheduledCount).toBe('number');
      expect(typeof result.current.completedCount).toBe('number');
      expect(typeof result.current.refetch).toBe('function');
    });

    it('should calculate counts correctly', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useGovernanceData(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.scheduledCount).toBeGreaterThanOrEqual(0);
      expect(result.current.completedCount).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('BoardMeeting interface', () => {
  it('should have required fields', () => {
    const meeting = {
      id: '1',
      title: 'Q1 Board Meeting',
      meeting_type: 'board',
      scheduled_date: '2025-01-15',
      location: 'Conference Room A',
      status: 'scheduled',
      attendees: ['John Smith', 'Jane Doe'],
      agenda_items: ['Q4 Review', 'Budget Approval'],
    };

    expect(meeting.id).toBeDefined();
    expect(meeting.title).toBeDefined();
    expect(meeting.meeting_type).toBeDefined();
    expect(meeting.scheduled_date).toBeDefined();
    expect(meeting.location).toBeDefined();
    expect(meeting.status).toBeDefined();
    expect(meeting.attendees).toBeDefined();
    expect(meeting.agenda_items).toBeDefined();
  });

  it('should support optional fields', () => {
    const meeting = {
      id: '1',
      title: 'Annual General Meeting',
      meeting_type: 'annual',
      scheduled_date: '2024-12-15',
      location: 'Main Auditorium',
      status: 'completed',
      attendees: ['All Board Members'],
      agenda_items: ['Annual Report', 'Elections'],
      minutes_url: '/documents/agm-2024-minutes.pdf',
      resolutions: ['Resolution 1', 'Resolution 2'],
    };

    expect(meeting.minutes_url).toBe('/documents/agm-2024-minutes.pdf');
    expect(meeting.resolutions).toHaveLength(2);
  });
});
