import { useQuery } from '@tanstack/react-query';

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  user_name: string;
  avatar_url?: string;
  score: number;
  change: number;
  achievements_count: number;
  streak_days: number;
}

export interface Leaderboard {
  id: string;
  name: string;
  description?: string;
  metric: 'points' | 'achievements' | 'events_completed' | 'hours_worked' | 'custom';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';
  entries: LeaderboardEntry[];
  total_participants: number;
  last_updated: string;
  organization_id: string;
}

export interface LeaderboardFilters {
  metric?: Leaderboard['metric'];
  period?: Leaderboard['period'];
  department?: string;
  team_id?: string;
}

async function fetchLeaderboards(filters?: LeaderboardFilters): Promise<{
  leaderboards: Leaderboard[];
  total: number;
}> {
  const params = new URLSearchParams();
  if (filters?.metric) params.set('metric', filters.metric);
  if (filters?.period) params.set('period', filters.period);
  if (filters?.department) params.set('department', filters.department);
  if (filters?.team_id) params.set('team_id', filters.team_id);

  const response = await fetch(`/api/leaderboards?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboards');
  }
  return response.json();
}

async function fetchLeaderboard(id: string): Promise<Leaderboard> {
  const response = await fetch(`/api/leaderboards/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }
  return response.json();
}

async function fetchMyRankings(): Promise<{
  rankings: Array<{
    leaderboard_id: string;
    leaderboard_name: string;
    metric: Leaderboard['metric'];
    period: Leaderboard['period'];
    rank: number;
    score: number;
    percentile: number;
  }>;
  best_rank: number;
  total_points: number;
}> {
  const response = await fetch('/api/leaderboards/my-rankings');
  if (!response.ok) {
    throw new Error('Failed to fetch my rankings');
  }
  return response.json();
}

export function useLeaderboards(filters?: LeaderboardFilters) {
  return useQuery({
    queryKey: ['leaderboards', filters],
    queryFn: () => fetchLeaderboards(filters),
  });
}

export function useLeaderboard(id: string) {
  return useQuery({
    queryKey: ['leaderboard', id],
    queryFn: () => fetchLeaderboard(id),
    enabled: !!id,
  });
}

export function useMyRankings() {
  return useQuery({
    queryKey: ['my-rankings'],
    queryFn: fetchMyRankings,
  });
}
