'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { log } from '@ghxstship/config';

// Types
export interface Artist {
  id: string;
  name: string;
  bio: string;
  image?: string;
  genre?: string;
  followers_count: number;
  verified: boolean;
  social_links?: {
    spotify?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}

export interface ArtistEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  image?: string;
  price?: number;
}

// Demo data
const DEMO_ARTIST: Artist = {
  id: '1',
  name: 'The Midnight',
  bio: 'Synthwave duo from Los Angeles creating nostalgic electronic music.',
  image: '/artists/midnight.jpg',
  genre: 'Synthwave',
  followers_count: 125000,
  verified: true,
  social_links: {
    spotify: 'https://spotify.com/artist/midnight',
    instagram: 'https://instagram.com/themidnight',
  },
};

const DEMO_EVENTS: ArtistEvent[] = [
  {
    id: '1',
    title: 'Summer Tour 2025',
    date: '2025-07-15',
    venue: 'The Wiltern',
    image: '/events/summer-tour.jpg',
    price: 45,
  },
];

// Query keys
export const artistDetailKeys = {
  all: ['artist-detail'] as const,
  detail: (id: string) => [...artistDetailKeys.all, id] as const,
  events: (id: string) => [...artistDetailKeys.all, id, 'events'] as const,
  followStatus: (id: string) => [...artistDetailKeys.all, id, 'follow'] as const,
};

// Fetch functions
async function fetchArtist(artistId: string): Promise<Artist | null> {
  const response = await fetch(`/api/artists/${artistId}`);
  if (response.status === 401) {
    return DEMO_ARTIST;
  }
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return data.artist;
}

async function fetchArtistEvents(artistId: string): Promise<ArtistEvent[]> {
  const response = await fetch(`/api/artists/${artistId}/events`);
  if (response.status === 401) {
    return DEMO_EVENTS;
  }
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return data.events || [];
}

async function fetchFollowStatus(artistId: string): Promise<boolean> {
  const response = await fetch(`/api/artists/${artistId}/follow/status`);
  if (response.status === 401) {
    return false;
  }
  if (!response.ok) {
    return false;
  }
  const data = await response.json();
  return data.following;
}

// Mutation functions
interface ToggleFollowParams {
  artistId: string;
  isFollowing: boolean;
}

async function toggleFollow({ artistId, isFollowing }: ToggleFollowParams): Promise<void> {
  const response = await fetch(`/api/artists/${artistId}/follow`, {
    method: isFollowing ? 'DELETE' : 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to update follow status');
  }
}

// Hooks
export function useArtist(artistId: string) {
  return useQuery({
    queryKey: artistDetailKeys.detail(artistId),
    queryFn: () => fetchArtist(artistId),
    staleTime: 5 * 60 * 1000,
    enabled: !!artistId,
  });
}

export function useArtistEvents(artistId: string) {
  return useQuery({
    queryKey: artistDetailKeys.events(artistId),
    queryFn: () => fetchArtistEvents(artistId),
    staleTime: 5 * 60 * 1000,
    enabled: !!artistId,
  });
}

export function useFollowStatus(artistId: string) {
  return useQuery({
    queryKey: artistDetailKeys.followStatus(artistId),
    queryFn: () => fetchFollowStatus(artistId),
    staleTime: 60 * 1000,
    enabled: !!artistId,
  });
}

export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleFollow,
    onSuccess: (_, { artistId }) => {
      queryClient.invalidateQueries({ queryKey: artistDetailKeys.detail(artistId) });
      queryClient.invalidateQueries({ queryKey: artistDetailKeys.followStatus(artistId) });
    },
    onError: (error) => {
      log.error('Failed to toggle follow:', error);
    },
  });
}

// Combined hook
export function useArtistDetailData(artistId: string) {
  const artistQuery = useArtist(artistId);
  const eventsQuery = useArtistEvents(artistId);
  const followStatusQuery = useFollowStatus(artistId);
  const toggleFollowMutation = useToggleFollow();

  return {
    // Data
    artist: artistQuery.data || null,
    events: eventsQuery.data || [],
    isFollowing: followStatusQuery.data || false,

    // Loading states
    isLoading: artistQuery.isLoading || eventsQuery.isLoading || followStatusQuery.isLoading,

    // Error states
    error: artistQuery.error || eventsQuery.error,

    // Mutations
    toggleFollow: (isFollowing: boolean) => toggleFollowMutation.mutateAsync({ artistId, isFollowing }),
    isTogglingFollow: toggleFollowMutation.isPending,

    // Refetch
    refetch: () => {
      artistQuery.refetch();
      eventsQuery.refetch();
      followStatusQuery.refetch();
    },
  };
}
