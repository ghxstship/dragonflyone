'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { log } from '@ghxstship/config';

// Types
export interface UserMatch {
  id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  interests: string[];
  favorite_genres: string[];
  events_attended: number;
  mutual_friends: number;
  match_score: number;
  is_following: boolean;
}

export interface Interest {
  id: string;
  name: string;
  category: string;
  icon: string;
}

export interface RecommendedEvent {
  id: string;
  title: string;
  date: string;
  venue_name: string;
  image_url?: string;
  match_reason: string;
  match_score: number;
}

// Demo data
const DEMO_MATCHES: UserMatch[] = [
  {
    id: '1',
    name: 'Alex Rivera',
    avatar_url: '/avatars/alex.jpg',
    bio: 'Music lover, concert enthusiast',
    location: 'Los Angeles, CA',
    interests: ['Rock', 'Indie', 'Live Music'],
    favorite_genres: ['Rock', 'Alternative'],
    events_attended: 42,
    mutual_friends: 5,
    match_score: 92,
    is_following: false,
  },
  {
    id: '2',
    name: 'Jordan Chen',
    avatar_url: '/avatars/jordan.jpg',
    bio: 'Festival season is my favorite season',
    location: 'San Francisco, CA',
    interests: ['EDM', 'Festivals', 'Dancing'],
    favorite_genres: ['Electronic', 'House'],
    events_attended: 28,
    mutual_friends: 3,
    match_score: 85,
    is_following: true,
  },
];

const DEMO_INTERESTS: Interest[] = [
  { id: '1', name: 'Rock', category: 'Genres', icon: '🎸' },
  { id: '2', name: 'Pop', category: 'Genres', icon: '🎤' },
  { id: '3', name: 'Electronic', category: 'Genres', icon: '🎧' },
  { id: '4', name: 'Hip Hop', category: 'Genres', icon: '🎹' },
  { id: '5', name: 'Festivals', category: 'Events', icon: '🎪' },
  { id: '6', name: 'Concerts', category: 'Events', icon: '🎵' },
  { id: '7', name: 'Club Shows', category: 'Events', icon: '🌃' },
];

const DEMO_EVENTS: RecommendedEvent[] = [
  {
    id: '1',
    title: 'Summer Music Festival',
    date: '2025-07-15',
    venue_name: 'Central Park',
    image_url: '/events/festival.jpg',
    match_reason: 'Based on your interest in festivals',
    match_score: 95,
  },
];

// Query keys
export const matchKeys = {
  all: ['match'] as const,
  users: () => [...matchKeys.all, 'users'] as const,
  interests: () => [...matchKeys.all, 'interests'] as const,
  events: () => [...matchKeys.all, 'events'] as const,
};

// Fetch functions
async function fetchMatches(): Promise<UserMatch[]> {
  const response = await fetch('/api/match/users');
  if (response.status === 401) {
    return DEMO_MATCHES;
  }
  if (!response.ok) {
    throw new Error('Failed to fetch matches');
  }
  const data = await response.json();
  return data.matches || [];
}

interface InterestsData {
  interests: Interest[];
  userInterests: string[];
}

async function fetchInterests(): Promise<InterestsData> {
  const response = await fetch('/api/match/interests');
  if (response.status === 401) {
    return { interests: DEMO_INTERESTS, userInterests: ['1', '5'] };
  }
  if (!response.ok) {
    throw new Error('Failed to fetch interests');
  }
  const data = await response.json();
  return {
    interests: data.interests || [],
    userInterests: data.user_interests || [],
  };
}

async function fetchRecommendedEvents(): Promise<RecommendedEvent[]> {
  const response = await fetch('/api/match/events');
  if (response.status === 401) {
    return DEMO_EVENTS;
  }
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  const data = await response.json();
  return data.events || [];
}

// Mutation functions
async function updateInterests(interests: string[]): Promise<void> {
  const response = await fetch('/api/match/interests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ interests }),
  });
  if (!response.ok) {
    throw new Error('Failed to update interests');
  }
}

async function followUser(userId: string): Promise<void> {
  const response = await fetch('/api/follows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!response.ok) {
    throw new Error('Failed to follow user');
  }
}

// Hooks
export function useMatches() {
  return useQuery({
    queryKey: matchKeys.users(),
    queryFn: fetchMatches,
    staleTime: 5 * 60 * 1000,
  });
}

export function useInterests() {
  return useQuery({
    queryKey: matchKeys.interests(),
    queryFn: fetchInterests,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecommendedEvents() {
  return useQuery({
    queryKey: matchKeys.events(),
    queryFn: fetchRecommendedEvents,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateInterests() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInterests,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.interests() });
      queryClient.invalidateQueries({ queryKey: matchKeys.users() });
      queryClient.invalidateQueries({ queryKey: matchKeys.events() });
    },
    onError: (error) => {
      log.error('Failed to update interests:', error);
    },
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: followUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.users() });
    },
    onError: (error) => {
      log.error('Failed to follow user:', error);
    },
  });
}

// Combined hook
export function useMatchData() {
  const matchesQuery = useMatches();
  const interestsQuery = useInterests();
  const eventsQuery = useRecommendedEvents();
  const updateInterestsMutation = useUpdateInterests();
  const followUserMutation = useFollowUser();

  return {
    // Data
    matches: matchesQuery.data || [],
    interests: interestsQuery.data?.interests || [],
    userInterests: interestsQuery.data?.userInterests || [],
    recommendedEvents: eventsQuery.data || [],

    // Loading states
    isLoading: matchesQuery.isLoading || interestsQuery.isLoading || eventsQuery.isLoading,

    // Error states
    error: matchesQuery.error || interestsQuery.error || eventsQuery.error,

    // Mutations
    updateInterests: updateInterestsMutation.mutateAsync,
    isUpdatingInterests: updateInterestsMutation.isPending,

    followUser: followUserMutation.mutateAsync,
    isFollowingUser: followUserMutation.isPending,

    // Refetch
    refetch: () => {
      matchesQuery.refetch();
      interestsQuery.refetch();
      eventsQuery.refetch();
    },
  };
}
