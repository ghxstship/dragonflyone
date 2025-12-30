'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// ARTIST PORTAL HOOKS
// Manage artist portal data
// =============================================================================

export interface ArtistData {
  artistName: string;
  upcomingShows: number;
  confirmedBookings: number;
  pendingRiders: number;
}

export interface UpcomingShow {
  id: string;
  event: string;
  venue: string;
  date: string;
  time: string;
  setLength: string;
  status: 'confirmed' | 'pending';
}

export interface RiderStatus {
  category: string;
  status: 'approved' | 'pending' | 'review';
  lastUpdated: string;
}

// Fetch artist data
export function useArtistData() {
  return useQuery({
    queryKey: ['artist-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('people_profile_artist')
        .select('*')
        .single();

      if (error) throw error;
      
      return {
        artistName: data?.name || 'Artist',
        upcomingShows: data?.upcoming_shows_count || 0,
        confirmedBookings: data?.confirmed_bookings_count || 0,
        pendingRiders: data?.pending_riders_count || 0,
      } as ArtistData;
    },
  });
}

// Fetch upcoming shows
export function useUpcomingShows() {
  return useQuery({
    queryKey: ['upcoming-shows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_events')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(5);

      if (error) throw error;
      
      return (data || []).map(s => ({
        id: s.id,
        event: s.event_name,
        venue: s.venue_name,
        date: s.date,
        time: s.time,
        setLength: s.set_length,
        status: s.status,
      })) as UpcomingShow[];
    },
  });
}

// Fetch rider status
export function useRiderStatus() {
  return useQuery({
    queryKey: ['rider-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_documents')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(r => ({
        category: r.category,
        status: r.status,
        lastUpdated: r.updated_at,
      })) as RiderStatus[];
    },
  });
}
