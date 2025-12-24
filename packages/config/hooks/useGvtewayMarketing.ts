import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Early Bird Offers
export interface EarlyBirdOffer {
  id: string;
  name: string;
  discount: number;
  startDate: string;
  endDate: string;
  ticketsSold: number;
  maxTickets: number;
  status: 'Active' | 'Scheduled' | 'Ended';
  created_at?: string;
  updated_at?: string;
}

// Influencer
export interface Influencer {
  id: string;
  name: string;
  handle: string;
  platform: string;
  followers: number;
  engagement: number;
  status: 'Active' | 'Pending' | 'Completed';
  commission: number;
  sales: number;
  revenue: number;
  created_at?: string;
  updated_at?: string;
}

// Media Kit
export interface MediaKitAsset {
  id: string;
  name: string;
  type: string;
  format: string;
  size: string;
  downloads: number;
  lastUpdated: string;
  created_at?: string;
  updated_at?: string;
}

// Tracking Pixel
export interface TrackingPixel {
  id: string;
  name: string;
  platform: string;
  pixelId: string;
  status: 'Active' | 'Inactive';
  events: string[];
  conversions: number;
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/marketing';

// Early Bird hooks
async function fetchEarlyBirdOffers(): Promise<EarlyBirdOffer[]> {
  const response = await fetch(`${API_BASE}/early-bird`);
  if (!response.ok) return [];
  const { data } = await response.json();
  return data || [];
}

export function useEarlyBirdOffersQuery() {
  return useQuery({
    queryKey: ['early-bird-offers'],
    queryFn: fetchEarlyBirdOffers,
    staleTime: 60000,
  });
}

export function useEarlyBirdOffers() {
  const query = useEarlyBirdOffersQuery();
  const offers = query.data || [];
  const activeOffers = offers.filter(o => o.status === 'Active').length;
  const totalSold = offers.reduce((s, o) => s + o.ticketsSold, 0);

  return {
    offers,
    summary: { activeOffers, totalSold, totalOffers: offers.length },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Influencer hooks
async function fetchInfluencers(): Promise<Influencer[]> {
  const response = await fetch(`${API_BASE}/influencers`);
  if (!response.ok) return [];
  const { data } = await response.json();
  return data || [];
}

export function useInfluencersQuery() {
  return useQuery({
    queryKey: ['influencers'],
    queryFn: fetchInfluencers,
    staleTime: 60000,
  });
}

export function useInfluencers() {
  const query = useInfluencersQuery();
  const influencers = query.data || [];
  const activeInfluencers = influencers.filter(i => i.status === 'Active').length;
  const totalRevenue = influencers.reduce((s, i) => s + i.revenue, 0);

  return {
    influencers,
    summary: { activeInfluencers, totalRevenue, totalInfluencers: influencers.length },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Media Kit hooks
async function fetchMediaKitAssets(): Promise<MediaKitAsset[]> {
  const response = await fetch(`${API_BASE}/media-kit`);
  if (!response.ok) return [];
  const { data } = await response.json();
  return data || [];
}

export function useMediaKitAssetsQuery() {
  return useQuery({
    queryKey: ['media-kit-assets'],
    queryFn: fetchMediaKitAssets,
    staleTime: 60000,
  });
}

export function useMediaKitAssets() {
  const query = useMediaKitAssetsQuery();
  const assets = query.data || [];
  const totalDownloads = assets.reduce((s, a) => s + a.downloads, 0);

  return {
    assets,
    summary: { totalAssets: assets.length, totalDownloads },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Tracking Pixels hooks
async function fetchTrackingPixels(): Promise<TrackingPixel[]> {
  const response = await fetch(`${API_BASE}/pixels`);
  if (!response.ok) return [];
  const { data } = await response.json();
  return data || [];
}

export function useTrackingPixelsQuery() {
  return useQuery({
    queryKey: ['tracking-pixels'],
    queryFn: fetchTrackingPixels,
    staleTime: 60000,
  });
}

export function useTrackingPixels() {
  const query = useTrackingPixelsQuery();
  const pixels = query.data || [];
  const activePixels = pixels.filter(p => p.status === 'Active').length;
  const totalConversions = pixels.reduce((s, p) => s + p.conversions, 0);

  return {
    pixels,
    summary: { activePixels, totalConversions, totalPixels: pixels.length },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
