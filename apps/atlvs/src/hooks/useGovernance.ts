'use client';

import { useQuery } from '@tanstack/react-query';

export interface BoardMeeting {
  id: string;
  title: string;
  meeting_type: string;
  scheduled_date: string;
  location: string;
  status: string;
  attendees: string[];
  agenda_items: string[];
  minutes_url?: string;
  resolutions?: string[];
  [key: string]: unknown;
}

const DEMO_MEETINGS: BoardMeeting[] = [
  {
    id: '1',
    title: 'Q1 Board Meeting',
    meeting_type: 'board',
    scheduled_date: '2025-01-15',
    location: 'Conference Room A',
    status: 'scheduled',
    attendees: ['John Smith', 'Jane Doe', 'Bob Wilson'],
    agenda_items: ['Q4 Review', 'Budget Approval', 'Strategic Planning'],
  },
  {
    id: '2',
    title: 'Annual General Meeting',
    meeting_type: 'annual',
    scheduled_date: '2024-12-15',
    location: 'Main Auditorium',
    status: 'completed',
    attendees: ['All Board Members'],
    agenda_items: ['Annual Report', 'Elections', 'Resolutions'],
    minutes_url: '/documents/agm-2024-minutes.pdf',
  },
];

export const governanceKeys = {
  all: ['governance'] as const,
  meetings: () => [...governanceKeys.all, 'meetings'] as const,
};

export function useGovernanceMeetings() {
  return useQuery({
    queryKey: governanceKeys.meetings(),
    queryFn: async () => {
      const response = await fetch('/api/governance');
      if (response.status === 401) {
        return DEMO_MEETINGS;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch governance data');
      }
      const data = await response.json();
      return data.meetings || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGovernanceData() {
  const meetingsQuery = useGovernanceMeetings();

  const meetings = meetingsQuery.data || [];
  const scheduledCount = meetings.filter(m => m.status === 'scheduled').length;
  const completedCount = meetings.filter(m => m.status === 'completed').length;

  return {
    meetings,
    scheduledCount,
    completedCount,
    isLoading: meetingsQuery.isLoading,
    error: meetingsQuery.error,
    refetch: meetingsQuery.refetch,
  };
}
