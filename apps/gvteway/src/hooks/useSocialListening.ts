'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface SocialMention {
  id: string;
  platform: 'twitter' | 'instagram' | 'facebook' | 'tiktok' | 'youtube';
  content: string;
  author: string;
  author_followers?: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  engagement: number;
  url: string;
  created_at: string;
}

export interface SocialListeningConfig {
  id: string;
  keywords: string[];
  hashtags: string[];
  mentions: string[];
  platforms: string[];
  is_active: boolean;
}

export function useSocialMentions(eventId?: string, filters?: { platform?: string; sentiment?: string }) {
  return useQuery({
    queryKey: ['social-mentions', eventId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (eventId) params.append('event_id', eventId);
      if (filters?.platform) params.append('platform', filters.platform);
      if (filters?.sentiment) params.append('sentiment', filters.sentiment);
      
      const response = await fetch(`/api/social-listening?${params}`);
      if (!response.ok) throw new Error('Failed to fetch social mentions');
      return response.json();
    },
    enabled: !!eventId,
  });
}

export function useSocialSentiment(eventId?: string) {
  return useQuery({
    queryKey: ['social-sentiment', eventId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (eventId) params.append('event_id', eventId);
      params.append('type', 'sentiment');
      
      const response = await fetch(`/api/social-listening?${params}`);
      if (!response.ok) throw new Error('Failed to fetch social sentiment');
      return response.json();
    },
    enabled: !!eventId,
  });
}

export function useCreateSocialListeningConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      event_id: string;
      keywords: string[];
      hashtags?: string[];
      mentions?: string[];
      platforms?: string[];
    }) => {
      const response = await fetch('/api/social-listening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create social listening config');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['social-mentions', variables.event_id] });
    },
  });
}

export function useSocialTrends(eventId?: string) {
  return useQuery({
    queryKey: ['social-trends', eventId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (eventId) params.append('event_id', eventId);
      params.append('type', 'trends');
      
      const response = await fetch(`/api/social-listening?${params}`);
      if (!response.ok) throw new Error('Failed to fetch social trends');
      return response.json();
    },
    enabled: !!eventId,
  });
}
