'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Friend {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  status: 'online' | 'offline' | 'at_event';
  current_event_id?: string;
  current_event_name?: string;
  last_seen?: string;
  location?: {
    lat: number;
    lng: number;
    section?: string;
  };
}

export interface Meetup {
  id: string;
  event_id: string;
  event_name: string;
  event_date: string;
  organizer_id: string;
  organizer_name: string;
  location: string;
  time: string;
  attendees: string[];
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

const DEMO_FRIENDS: Friend[] = [
  { id: '1', user_id: 'u1', name: 'Alex Johnson', status: 'online', avatar_url: '/avatars/alex.jpg' },
  { id: '2', user_id: 'u2', name: 'Sarah Chen', status: 'at_event', current_event_name: 'Summer Festival', avatar_url: '/avatars/sarah.jpg' },
];

const DEMO_MEETUPS: Meetup[] = [
  { id: 'm1', event_id: 'e1', event_name: 'Summer Festival', event_date: '2025-07-15', organizer_id: 'u1', organizer_name: 'Alex Johnson', location: 'Main Stage', time: '7:00 PM', attendees: ['u1', 'u2'], status: 'confirmed' },
];

export const friendsKeys = {
  all: ['friends'] as const,
  list: () => [...friendsKeys.all, 'list'] as const,
  meetups: () => [...friendsKeys.all, 'meetups'] as const,
};

export function useFriendsList() {
  return useQuery({
    queryKey: friendsKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/friends');
      if (response.status === 401) {
        return DEMO_FRIENDS;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch friends');
      }
      const data = await response.json();
      return data.friends || [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useMeetupsList() {
  return useQuery({
    queryKey: friendsKeys.meetups(),
    queryFn: async () => {
      const response = await fetch('/api/friends/meetups');
      if (response.status === 401) {
        return DEMO_MEETUPS;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch meetups');
      }
      const data = await response.json();
      return data.meetups || [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateMeetup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (meetup: { event_id: string; location: string; time: string; invitees: string[] }) => {
      const response = await fetch('/api/friends/meetups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetup),
      });
      if (!response.ok) {
        throw new Error('Failed to create meetup');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendsKeys.meetups() });
    },
  });
}

export function useFriendsData() {
  const friendsQuery = useFriendsList();
  const meetupsQuery = useMeetupsList();
  const createMeetupMutation = useCreateMeetup();

  return {
    friends: friendsQuery.data || [],
    meetups: meetupsQuery.data || [],
    isLoading: friendsQuery.isLoading || meetupsQuery.isLoading,
    error: friendsQuery.error || meetupsQuery.error,
    refetch: () => {
      friendsQuery.refetch();
      meetupsQuery.refetch();
    },
    createMeetup: createMeetupMutation.mutateAsync,
  };
}
