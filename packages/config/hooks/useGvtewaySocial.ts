import { useQuery, useQueryClient } from '@tanstack/react-query';

// Crisis Management
export interface CrisisIncident {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Monitoring' | 'Resolved';
  platform: string;
  mentions: number;
  sentiment: number;
  startedAt: string;
  resolvedAt?: string;
  created_at?: string;
  updated_at?: string;
}

// Sentiment Analysis
export interface SentimentData {
  id: string;
  platform: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  trend: 'up' | 'down' | 'stable';
  created_at?: string;
}

// Story Template
export interface StoryTemplate {
  id: string;
  name: string;
  category: string;
  platform: string;
  uses: number;
  engagement: number;
  thumbnail?: string;
  created_at?: string;
  updated_at?: string;
}

// TikTok Challenge
export interface TikTokChallenge {
  id: string;
  name: string;
  hashtag: string;
  status: 'Active' | 'Scheduled' | 'Ended';
  participants: number;
  views: number;
  engagement: number;
  startDate: string;
  endDate?: string;
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/social';

// Crisis Management hooks
async function fetchCrisisIncidents(): Promise<CrisisIncident[]> {
  const response = await fetch(`${API_BASE}/crisis`);
  if (!response.ok) return [];
  const { data } = await response.json();
  return data || [];
}

export function useCrisisIncidentsQuery() {
  return useQuery({
    queryKey: ['crisis-incidents'],
    queryFn: fetchCrisisIncidents,
    staleTime: 30000,
  });
}

export function useCrisisManagement() {
  const query = useCrisisIncidentsQuery();
  const incidents = query.data || [];
  const activeIncidents = incidents.filter(i => i.status === 'Active').length;
  const criticalCount = incidents.filter(i => i.severity === 'Critical' && i.status === 'Active').length;

  return {
    incidents,
    summary: { activeIncidents, criticalCount, totalIncidents: incidents.length },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Sentiment Analysis hooks
async function fetchSentimentData(): Promise<SentimentData[]> {
  const response = await fetch(`${API_BASE}/sentiment`);
  if (!response.ok) return [];
  const { data } = await response.json();
  return data || [];
}

export function useSentimentDataQuery() {
  return useQuery({
    queryKey: ['sentiment-data'],
    queryFn: fetchSentimentData,
    staleTime: 60000,
  });
}

export function useSentimentAnalysis() {
  const query = useSentimentDataQuery();
  const data = query.data || [];
  const totalPositive = data.reduce((s, d) => s + d.positive, 0);
  const totalNegative = data.reduce((s, d) => s + d.negative, 0);
  const totalMentions = data.reduce((s, d) => s + d.total, 0);

  return {
    data,
    summary: { totalPositive, totalNegative, totalMentions },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Story Templates hooks
async function fetchStoryTemplates(): Promise<StoryTemplate[]> {
  const response = await fetch(`${API_BASE}/story-templates`);
  if (!response.ok) return [];
  const { data } = await response.json();
  return data || [];
}

export function useStoryTemplatesQuery() {
  return useQuery({
    queryKey: ['story-templates'],
    queryFn: fetchStoryTemplates,
    staleTime: 60000,
  });
}

export function useStoryTemplates() {
  const query = useStoryTemplatesQuery();
  const templates = query.data || [];
  const totalUses = templates.reduce((s, t) => s + t.uses, 0);

  return {
    templates,
    summary: { totalTemplates: templates.length, totalUses },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// TikTok Challenges hooks
async function fetchTikTokChallenges(): Promise<TikTokChallenge[]> {
  const response = await fetch(`${API_BASE}/tiktok-challenges`);
  if (!response.ok) return [];
  const { data } = await response.json();
  return data || [];
}

export function useTikTokChallengesQuery() {
  return useQuery({
    queryKey: ['tiktok-challenges'],
    queryFn: fetchTikTokChallenges,
    staleTime: 60000,
  });
}

export function useTikTokChallenges() {
  const query = useTikTokChallengesQuery();
  const challenges = query.data || [];
  const activeChallenges = challenges.filter(c => c.status === 'Active').length;
  const totalViews = challenges.reduce((s, c) => s + c.views, 0);

  return {
    challenges,
    summary: { activeChallenges, totalViews, totalChallenges: challenges.length },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
