'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// SOCIAL AMPLIFICATION HOOKS
// Manage artist profiles and amplification campaigns
// =============================================================================

export interface ArtistProfile {
  id: string;
  name: string;
  genre: string;
  followers: number;
  status: 'Active' | 'Inactive' | 'Pending';
  platforms: { name: string; handle: string; followers: number }[];
  scheduledPosts: number;
  engagement: number;
}

export interface AmplificationCampaign {
  id: string;
  name: string;
  eventName: string;
  event: string;
  artists: string[];
  startDate: string;
  endDate: string;
  status: 'Active' | 'Scheduled' | 'Completed' | 'Pending';
  reach: number;
  posts: number;
  engagement: string;
}

// Fetch artist profiles
export function useArtistProfiles() {
  return useQuery({
    queryKey: ['artist-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_people')
        .select('*')
        .order('followers', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(a => ({
        id: a.id,
        name: a.artist_name || a.name,
        genre: a.genre,
        followers: a.total_followers || 0,
        status: a.status || 'Active',
        platforms: a.platforms || [],
        scheduledPosts: a.scheduled_posts || 0,
        engagement: a.engagement_rate || 0,
      })) as ArtistProfile[];
    },
  });
}

// Fetch amplification campaigns
export function useAmplificationCampaigns() {
  return useQuery({
    queryKey: ['amplification-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(c => ({
        id: c.id,
        name: c.name,
        eventName: c.event_name,
        event: c.event_name,
        artists: c.artist_ids || [],
        startDate: c.start_date,
        endDate: c.end_date,
        status: c.status || 'Scheduled',
        reach: c.reach || 0,
        posts: c.posts_count || 0,
        engagement: c.engagement_rate || '0%',
      })) as AmplificationCampaign[];
    },
  });
}

// Create campaign
export function useCreateAmplificationCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaign: Omit<AmplificationCampaign, 'id' | 'reach' | 'posts' | 'engagement'>) => {
      const { data, error } = await supabase
        .from('deals')
        .insert({
          name: campaign.name,
          event_name: campaign.eventName,
          artist_ids: campaign.artists,
          start_date: campaign.startDate,
          end_date: campaign.endDate,
          status: campaign.status,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amplification-campaigns'] });
    },
  });
}
