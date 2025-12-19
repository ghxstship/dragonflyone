import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ShareLink {
  id: string;
  event_id: string;
  share_type: 'public' | 'private' | 'password_protected';
  url: string;
  short_url?: string;
  password?: string;
  expires_at?: string;
  max_uses?: number;
  use_count: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  custom_slug?: string;
  metadata?: Record<string, unknown>;
  created_by: string;
  created_at: string;
}

export interface ShareAnalytics {
  link_id: string;
  total_clicks: number;
  unique_visitors: number;
  conversions: number;
  conversion_rate: number;
  revenue_generated: number;
  clicks_by_day: Array<{ date: string; clicks: number }>;
  clicks_by_source: Record<string, number>;
  clicks_by_device: Record<string, number>;
  clicks_by_country: Array<{ country: string; clicks: number }>;
  top_referrers: Array<{ referrer: string; clicks: number }>;
}

export interface SocialShareConfig {
  event_id: string;
  title: string;
  description: string;
  image_url: string;
  hashtags?: string[];
  twitter_handle?: string;
  facebook_app_id?: string;
}

async function fetchShareLinks(eventId: string): Promise<{ links: ShareLink[] }> {
  const response = await fetch(`/api/events/${eventId}/share-links`);
  if (!response.ok) {
    throw new Error('Failed to fetch share links');
  }
  return response.json();
}

async function createShareLink(input: {
  eventId: string;
  shareType: ShareLink['share_type'];
  password?: string;
  expiresAt?: string;
  maxUses?: number;
  customSlug?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}): Promise<ShareLink> {
  const response = await fetch(`/api/events/${input.eventId}/share-links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create share link');
  }
  return response.json();
}

async function deleteShareLink(input: { eventId: string; linkId: string }): Promise<void> {
  const response = await fetch(`/api/events/${input.eventId}/share-links/${input.linkId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete share link');
  }
}

async function fetchShareAnalytics(linkId: string): Promise<ShareAnalytics> {
  const response = await fetch(`/api/share-links/${linkId}/analytics`);
  if (!response.ok) {
    throw new Error('Failed to fetch analytics');
  }
  return response.json();
}

async function fetchSocialShareConfig(eventId: string): Promise<SocialShareConfig> {
  const response = await fetch(`/api/events/${eventId}/social-share`);
  if (!response.ok) {
    throw new Error('Failed to fetch social config');
  }
  return response.json();
}

async function updateSocialShareConfig(input: { eventId: string; config: Partial<SocialShareConfig> }): Promise<SocialShareConfig> {
  const response = await fetch(`/api/events/${input.eventId}/social-share`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input.config),
  });
  if (!response.ok) {
    throw new Error('Failed to update config');
  }
  return response.json();
}

async function trackShare(input: { eventId: string; platform: string; linkId?: string }): Promise<void> {
  await fetch(`/api/events/${input.eventId}/track-share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export function useShareLinks(eventId: string) {
  return useQuery({
    queryKey: ['share-links', eventId],
    queryFn: () => fetchShareLinks(eventId),
    enabled: !!eventId,
  });
}

export function useCreateShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createShareLink,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['share-links', data.event_id] });
    },
  });
}

export function useDeleteShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteShareLink,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['share-links', variables.eventId] });
    },
  });
}

export function useShareAnalytics(linkId: string) {
  return useQuery({
    queryKey: ['share-analytics', linkId],
    queryFn: () => fetchShareAnalytics(linkId),
    enabled: !!linkId,
  });
}

export function useSocialShareConfig(eventId: string) {
  return useQuery({
    queryKey: ['social-share-config', eventId],
    queryFn: () => fetchSocialShareConfig(eventId),
    enabled: !!eventId,
  });
}

export function useUpdateSocialShareConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSocialShareConfig,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['social-share-config', data.event_id] });
    },
  });
}

export function useTrackShare() {
  return useMutation({
    mutationFn: trackShare,
  });
}
