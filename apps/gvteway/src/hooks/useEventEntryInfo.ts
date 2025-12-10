'use client';

import { useQuery } from '@tanstack/react-query';

export interface EntryInfo {
  event_id: string;
  event_title: string;
  event_date: string;
  event_time: string;
  venue_name: string;
  venue_address: string;
  venue_city: string;
  doors_open: string;
  show_starts: string;
  entry_gates: { name: string; location: string; recommended_for?: string }[];
  prohibited_items: string[];
  allowed_items: string[];
  bag_policy: string;
  age_restriction?: string;
  dress_code?: string;
  parking_info: {
    available: boolean;
    lots: { name: string; address: string; price?: string }[];
    tips?: string;
  };
  transit_info: {
    subway?: string;
    bus?: string;
    rideshare_dropoff?: string;
  };
  tips: string[];
  faq: { question: string; answer: string }[];
}

const DEMO_ENTRY_INFO: EntryInfo = {
  event_id: 'demo-1',
  event_title: 'Summer Festival 2024',
  event_date: new Date(Date.now() + 7 * 86400000).toISOString(),
  event_time: '7:00 PM',
  venue_name: 'Central Park',
  venue_address: '123 Park Ave',
  venue_city: 'New York, NY',
  doors_open: '5:00 PM',
  show_starts: '7:00 PM',
  entry_gates: [
    { name: 'Gate A', location: 'North Entrance', recommended_for: 'VIP ticket holders' },
    { name: 'Gate B', location: 'South Entrance', recommended_for: 'General admission' },
  ],
  prohibited_items: ['Weapons', 'Outside food/drinks', 'Professional cameras', 'Drones'],
  allowed_items: ['Small bags', 'Phone cameras', 'Sealed water bottles'],
  bag_policy: 'Bags must be smaller than 12"x12"x6"',
  parking_info: {
    available: true,
    lots: [{ name: 'Lot A', address: '100 Park Ave', price: '$25' }],
    tips: 'Arrive early for best parking',
  },
  transit_info: {
    subway: 'Take the A/C/E to 59th St',
    rideshare_dropoff: 'Drop-off zone at Gate A',
  },
  tips: ['Arrive early', 'Bring ID', 'Check weather forecast'],
  faq: [{ question: 'Can I re-enter?', answer: 'Yes, with hand stamp' }],
};

export const entryInfoKeys = {
  all: ['entry-info'] as const,
  detail: (eventId: string) => [...entryInfoKeys.all, eventId] as const,
};

export function useEventEntryInfo(eventId: string) {
  return useQuery({
    queryKey: entryInfoKeys.detail(eventId),
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/entry-info`);
      if (!response.ok) return DEMO_ENTRY_INFO;
      const data = await response.json();
      return data.info || DEMO_ENTRY_INFO;
    },
    enabled: !!eventId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useEventEntryInfoData(eventId: string) {
  const query = useEventEntryInfo(eventId);

  return {
    info: query.data || null,
    isLoading: query.isLoading,
    error: query.error,
  };
}
