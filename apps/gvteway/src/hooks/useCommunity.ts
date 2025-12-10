'use client';

import { useQuery } from '@tanstack/react-query';

export interface Forum {
  id: string;
  title: string;
  posts: number;
  members: number;
  lastActive: string;
  trending: boolean;
  category?: string;
}

export interface CommunityGroup {
  id: string;
  name: string;
  members_count: number;
  privacy: string;
  description: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  attendees_count: number;
}

const DEMO_FORUMS: Forum[] = [
  { id: 'demo-1', title: 'Festival Tips & Tricks', posts: 1234, members: 5678, lastActive: '2 hours ago', trending: true, category: 'General' },
  { id: 'demo-2', title: 'Artist Discussions', posts: 890, members: 3456, lastActive: '5 hours ago', trending: false, category: 'Music' },
];

const DEMO_GROUPS: CommunityGroup[] = [
  { id: 'demo-1', name: 'EDM Lovers', members_count: 2500, privacy: 'public', description: 'A community for electronic dance music enthusiasts' },
  { id: 'demo-2', name: 'Festival Photographers', members_count: 890, privacy: 'public', description: 'Share your best festival shots' },
];

const DEMO_EVENTS: CommunityEvent[] = [
  { id: 'demo-1', title: 'Pre-Festival Meetup', description: 'Meet fellow fans before the big day!', location: 'Downtown Coffee House', event_date: new Date(Date.now() + 7 * 86400000).toISOString(), attendees_count: 45 },
];

export const communityKeys = {
  all: ['community'] as const,
  forums: () => [...communityKeys.all, 'forums'] as const,
  groups: () => [...communityKeys.all, 'groups'] as const,
  events: () => [...communityKeys.all, 'events'] as const,
};

export function useCommunityData() {
  const forumsQuery = useQuery({
    queryKey: communityKeys.forums(),
    queryFn: async () => {
      const response = await fetch('/api/community/forums');
      if (!response.ok) return DEMO_FORUMS;
      const data = await response.json();
      return data.forums || DEMO_FORUMS;
    },
    staleTime: 5 * 60 * 1000,
  });

  const groupsQuery = useQuery({
    queryKey: communityKeys.groups(),
    queryFn: async () => {
      const response = await fetch('/api/community/groups');
      if (!response.ok) return DEMO_GROUPS;
      const data = await response.json();
      return data.groups || DEMO_GROUPS;
    },
    staleTime: 5 * 60 * 1000,
  });

  const eventsQuery = useQuery({
    queryKey: communityKeys.events(),
    queryFn: async () => {
      const response = await fetch('/api/community/events');
      if (!response.ok) return DEMO_EVENTS;
      const data = await response.json();
      return data.events || DEMO_EVENTS;
    },
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = forumsQuery.isLoading || groupsQuery.isLoading || eventsQuery.isLoading;

  return {
    forums: forumsQuery.data || [],
    groups: groupsQuery.data || [],
    communityEvents: eventsQuery.data || [],
    isLoading,
    error: forumsQuery.error || groupsQuery.error || eventsQuery.error,
    refetch: () => {
      forumsQuery.refetch();
      groupsQuery.refetch();
      eventsQuery.refetch();
    },
  };
}
