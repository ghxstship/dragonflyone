import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'performance' | 'teamwork' | 'learning' | 'safety' | 'innovation' | 'milestone';
  criteria: {
    type: 'count' | 'threshold' | 'streak' | 'completion';
    metric: string;
    target: number;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';
  };
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  is_hidden: boolean;
  organization_id: string;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  user_name: string;
  achievement_id: string;
  achievement: Achievement;
  earned_at: string;
  progress: number;
  target: number;
  metadata?: Record<string, unknown>;
}

export interface AchievementProgress {
  achievement_id: string;
  achievement: Achievement;
  current_progress: number;
  target: number;
  percentage: number;
  earned: boolean;
  earned_at?: string;
}

async function fetchAchievements(): Promise<{ achievements: Achievement[]; total: number }> {
  const response = await fetch('/api/achievements');
  if (!response.ok) {
    throw new Error('Failed to fetch achievements');
  }
  return response.json();
}

async function fetchUserAchievements(userId: string): Promise<{
  achievements: UserAchievement[];
  total_points: number;
  stats: {
    total_earned: number;
    by_category: Record<string, number>;
    by_rarity: Record<string, number>;
    recent: UserAchievement[];
  };
}> {
  const response = await fetch(`/api/achievements/user/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user achievements');
  }
  return response.json();
}

async function fetchMyAchievements(): Promise<{
  earned: UserAchievement[];
  in_progress: AchievementProgress[];
  total_points: number;
  rank: number;
}> {
  const response = await fetch('/api/achievements/my');
  if (!response.ok) {
    throw new Error('Failed to fetch my achievements');
  }
  return response.json();
}

async function awardAchievement(input: {
  userId: string;
  achievementId: string;
  metadata?: Record<string, unknown>;
}): Promise<UserAchievement> {
  const response = await fetch('/api/achievements/award', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to award achievement');
  }
  return response.json();
}

async function createAchievement(input: Omit<Achievement, 'id' | 'organization_id' | 'created_at'>): Promise<Achievement> {
  const response = await fetch('/api/achievements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create achievement');
  }
  return response.json();
}

export function useAchievements() {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: fetchAchievements,
  });
}

export function useUserAchievements(userId: string) {
  return useQuery({
    queryKey: ['user-achievements', userId],
    queryFn: () => fetchUserAchievements(userId),
    enabled: !!userId,
  });
}

export function useMyAchievements() {
  return useQuery({
    queryKey: ['my-achievements'],
    queryFn: fetchMyAchievements,
  });
}

export function useAwardAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: awardAchievement,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['user-achievements', data.user_id] });
      queryClient.invalidateQueries({ queryKey: ['my-achievements'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboards'] });
    },
  });
}

export function useCreateAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAchievement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
}
