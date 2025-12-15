'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DEMO_CHALLENGES, DEMO_LEADERBOARD } from '@/lib/demo-data';

// Types
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'Individual' | 'Community' | 'Team';
  category: string;
  status: 'Active' | 'Upcoming' | 'Completed';
  goal: number;
  currentProgress: number;
  userProgress?: number;
  userCompleted?: boolean;
  reward: string;
  rewardPoints: number;
  participants: number;
  endDate: string;
  artist?: { id: string; name: string };
  prizes?: Array<{ id: string; place: number; prize_description: string; prize_value: number }>;
}

export interface LeaderboardEntry {
  rank: number;
  userName: string;
  points: number;
  completedChallenges: number;
}

export interface ChallengesData {
  challenges: Challenge[];
  active: Challenge[];
  upcoming: Challenge[];
  completed: Challenge[];
}

// Query keys
export const challengesKeys = {
  all: ['challenges'] as const,
  list: (status?: string) => [...challengesKeys.all, 'list', status] as const,
  leaderboard: () => [...challengesKeys.all, 'leaderboard'] as const,
  userStats: () => [...challengesKeys.all, 'userStats'] as const,
};

// Fetch functions
async function fetchChallenges(status?: string): Promise<ChallengesData> {
  const url = status ? `/api/community-challenges?status=${status}` : '/api/community-challenges';
  const response = await fetch(url);
  
  if (!response.ok) {
    // Return demo data as fallback
    return {
      challenges: DEMO_CHALLENGES,
      active: DEMO_CHALLENGES.filter(c => c.status === 'Active'),
      upcoming: DEMO_CHALLENGES.filter(c => c.status === 'Upcoming'),
      completed: DEMO_CHALLENGES.filter(c => c.status === 'Completed'),
    };
  }
  
  const data = await response.json();
  
  // If no challenges from API, use demo data
  if (!data.challenges || data.challenges.length === 0) {
    return {
      challenges: DEMO_CHALLENGES,
      active: DEMO_CHALLENGES.filter(c => c.status === 'Active'),
      upcoming: DEMO_CHALLENGES.filter(c => c.status === 'Upcoming'),
      completed: DEMO_CHALLENGES.filter(c => c.status === 'Completed'),
    };
  }
  
  // Transform API data to match our interface
  const transformedChallenges = data.challenges.map((c: Record<string, unknown>) => ({
    id: c.id,
    title: c.title || c.name,
    description: c.description,
    type: c.challenge_type === 'community' ? 'Community' : 'Individual',
    category: c.category || 'General',
    status: c.status === 'active' ? 'Active' : c.status === 'scheduled' ? 'Upcoming' : 'Completed',
    goal: c.goal_target || 100,
    currentProgress: c.current_progress || 0,
    userProgress: c.user_progress || 0,
    userCompleted: c.user_completed || false,
    reward: c.reward_description || 'Exclusive rewards',
    rewardPoints: c.reward_points || 100,
    participants: (c.participants as Array<{ count: number }>)?.[0]?.count || 0,
    endDate: c.end_date ? new Date(c.end_date as string).toLocaleDateString() : 'TBD',
    artist: c.artist,
    prizes: c.prizes,
  }));
  
  return {
    challenges: transformedChallenges,
    active: transformedChallenges.filter((c: Challenge) => c.status === 'Active'),
    upcoming: transformedChallenges.filter((c: Challenge) => c.status === 'Upcoming'),
    completed: transformedChallenges.filter((c: Challenge) => c.status === 'Completed'),
  };
}

async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const response = await fetch('/api/community-challenges/leaderboard');
  
  if (!response.ok) {
    return DEMO_LEADERBOARD;
  }
  
  const data = await response.json();
  return data.leaderboard || DEMO_LEADERBOARD;
}

async function fetchUserStats(): Promise<{ points: number; completed: number; rank: number }> {
  const response = await fetch('/api/community-challenges/user-stats');
  
  if (!response.ok) {
    return { points: 0, completed: 0, rank: 0 };
  }
  
  const data = await response.json();
  return data.stats || { points: 0, completed: 0, rank: 0 };
}

// Join challenge mutation
async function joinChallenge(challengeId: string): Promise<void> {
  const response = await fetch('/api/community-challenges', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'join', challenge_id: challengeId }),
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to join challenge');
  }
}

// Hooks
export function useChallenges(status?: string) {
  return useQuery({
    queryKey: challengesKeys.list(status),
    queryFn: () => fetchChallenges(status),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: challengesKeys.leaderboard(),
    queryFn: fetchLeaderboard,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserChallengeStats() {
  return useQuery({
    queryKey: challengesKeys.userStats(),
    queryFn: fetchUserStats,
    staleTime: 5 * 60 * 1000,
  });
}

export function useJoinChallenge() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: joinChallenge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: challengesKeys.all });
    },
  });
}

// Combined hook for the challenges page
export function useChallengesData() {
  const challengesQuery = useChallenges();
  const leaderboardQuery = useLeaderboard();
  const userStatsQuery = useUserChallengeStats();
  const joinMutation = useJoinChallenge();
  
  return {
    // Challenge data
    challenges: challengesQuery.data?.challenges || [],
    activeChallenges: challengesQuery.data?.active || [],
    upcomingChallenges: challengesQuery.data?.upcoming || [],
    completedChallenges: challengesQuery.data?.completed || [],
    
    // Leaderboard
    leaderboard: leaderboardQuery.data || [],
    
    // User stats
    userStats: userStatsQuery.data || { points: 0, completed: 0, rank: 0 },
    
    // Loading states
    isLoading: challengesQuery.isLoading,
    isLeaderboardLoading: leaderboardQuery.isLoading,
    
    // Error states
    error: challengesQuery.error,
    
    // Mutations
    joinChallenge: joinMutation.mutateAsync,
    isJoining: joinMutation.isPending,
    
    // Refetch
    refetch: challengesQuery.refetch,
  };
}
