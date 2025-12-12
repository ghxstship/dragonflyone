'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Influencer {
  id: string;
  user_id: string;
  name: string;
  email: string;
  social_handles: Record<string, string>;
  follower_count: number;
  tier: 'micro' | 'mid' | 'macro' | 'mega';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  commission_rate: number;
  created_at: string;
}

export interface AffiliateLink {
  id: string;
  influencer_id: string;
  event_id: string;
  code: string;
  url: string;
  clicks: number;
  conversions: number;
  revenue: number;
  created_at: string;
}

export function useInfluencers(filters?: { status?: string; tier?: string }) {
  return useQuery({
    queryKey: ['influencers', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.tier) params.append('tier', filters.tier);
      
      const response = await fetch(`/api/influencer-affiliates?${params}`);
      if (!response.ok) throw new Error('Failed to fetch influencers');
      return response.json();
    },
  });
}

export function useInfluencerLinks(influencerId?: string) {
  return useQuery({
    queryKey: ['influencer-links', influencerId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (influencerId) params.append('influencer_id', influencerId);
      params.append('type', 'links');
      
      const response = await fetch(`/api/influencer-affiliates?${params}`);
      if (!response.ok) throw new Error('Failed to fetch influencer links');
      return response.json();
    },
    enabled: !!influencerId,
  });
}

export function useCreateAffiliateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      influencer_id: string;
      event_id: string;
      custom_code?: string;
    }) => {
      const response = await fetch('/api/influencer-affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, action: 'create_link' }),
      });
      if (!response.ok) throw new Error('Failed to create affiliate link');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['influencer-links', variables.influencer_id] });
    },
  });
}

export function useApplyAsInfluencer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      user_id: string;
      name: string;
      email: string;
      social_handles: Record<string, string>;
      follower_count: number;
    }) => {
      const response = await fetch('/api/influencer-affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, action: 'apply' }),
      });
      if (!response.ok) throw new Error('Failed to apply as influencer');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencers'] });
    },
  });
}

export function useInfluencerStats(influencerId?: string) {
  return useQuery({
    queryKey: ['influencer-stats', influencerId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (influencerId) params.append('influencer_id', influencerId);
      params.append('type', 'stats');
      
      const response = await fetch(`/api/influencer-affiliates?${params}`);
      if (!response.ok) throw new Error('Failed to fetch influencer stats');
      return response.json();
    },
    enabled: !!influencerId,
  });
}
