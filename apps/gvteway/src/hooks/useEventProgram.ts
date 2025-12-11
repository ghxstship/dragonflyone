'use client';

import { useQuery } from '@tanstack/react-query';

export interface SetlistItem {
  id: string;
  order: number;
  title: string;
  artist?: string;
  duration?: string;
  notes?: string;
  is_encore?: boolean;
}

export interface ProgramSection {
  id: string;
  title: string;
  start_time?: string;
  description?: string;
  items: SetlistItem[];
}

export interface Performer {
  id: string;
  name: string;
  role?: string;
  image?: string;
  bio?: string;
}

export interface Sponsor {
  name: string;
  logo?: string;
  tier: string;
}

export interface EventProgram {
  event_id: string;
  event_title: string;
  event_date: string;
  venue_name: string;
  program_notes?: string;
  sections: ProgramSection[];
  performers: Performer[];
  sponsors?: Sponsor[];
}

const DEMO_PROGRAM: EventProgram = {
  event_id: 'demo-1',
  event_title: 'Summer Music Festival',
  event_date: new Date(Date.now() + 7 * 86400000).toISOString(),
  venue_name: 'Central Park Amphitheater',
  program_notes: 'Welcome to an evening of incredible music!',
  sections: [
    {
      id: 's1',
      title: 'Opening Act',
      start_time: '7:00 PM',
      items: [
        { id: 'i1', order: 1, title: 'Welcome Song', duration: '5:00' },
        { id: 'i2', order: 2, title: 'Crowd Favorite', duration: '4:30' },
      ],
    },
    {
      id: 's2',
      title: 'Main Performance',
      start_time: '8:00 PM',
      items: [
        { id: 'i3', order: 1, title: 'Hit Single', duration: '4:00' },
        { id: 'i4', order: 2, title: 'New Release', duration: '5:15' },
        { id: 'i5', order: 3, title: 'Encore', duration: '6:00', is_encore: true },
      ],
    },
  ],
  performers: [
    { id: 'p1', name: 'The Midnight', role: 'Headliner' },
    { id: 'p2', name: 'Aurora Rising', role: 'Opening Act' },
  ],
};

export const eventProgramKeys = {
  all: ['event-program'] as const,
  detail: (eventId: string) => [...eventProgramKeys.all, 'detail', eventId] as const,
};

export function useEventProgramDetail(eventId: string) {
  return useQuery({
    queryKey: eventProgramKeys.detail(eventId),
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/program`);
      if (!response.ok) return DEMO_PROGRAM;
      const data = await response.json();
      return data.program || DEMO_PROGRAM;
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useEventProgramData(eventId: string) {
  const programQuery = useEventProgramDetail(eventId);

  return {
    program: programQuery.data || null,
    isLoading: programQuery.isLoading,
    error: programQuery.error,
    refetch: programQuery.refetch,
  };
}
