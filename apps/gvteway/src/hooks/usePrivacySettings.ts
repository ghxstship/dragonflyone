'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { log } from '@ghxstship/config';

// Types
export interface BlockedUser {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  blocked_at: string;
}

export interface Report {
  id: string;
  reported_user_name: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

export interface PrivacySettings {
  profile_visibility: string;
  show_activity: boolean;
  allow_messages: string;
  show_events_attended: boolean;
  show_reviews: boolean;
}

// Demo data for unauthenticated users
const DEMO_BLOCKED_USERS: BlockedUser[] = [];

const DEMO_REPORTS: Report[] = [];

const DEMO_SETTINGS: PrivacySettings = {
  profile_visibility: 'public',
  show_activity: true,
  allow_messages: 'everyone',
  show_events_attended: true,
  show_reviews: true,
};

// Query keys
export const privacyKeys = {
  all: ['privacy'] as const,
  blockedUsers: () => [...privacyKeys.all, 'blocked'] as const,
  reports: () => [...privacyKeys.all, 'reports'] as const,
  settings: () => [...privacyKeys.all, 'settings'] as const,
};

// Fetch functions
async function fetchBlockedUsers(): Promise<BlockedUser[]> {
  const response = await fetch('/api/user/blocked');
  if (response.status === 401) {
    return DEMO_BLOCKED_USERS;
  }
  if (!response.ok) {
    throw new Error('Failed to fetch blocked users');
  }
  const data = await response.json();
  return data.blocked || [];
}

async function fetchReports(): Promise<Report[]> {
  const response = await fetch('/api/user/reports');
  if (response.status === 401) {
    return DEMO_REPORTS;
  }
  if (!response.ok) {
    throw new Error('Failed to fetch reports');
  }
  const data = await response.json();
  return data.reports || [];
}

async function fetchPrivacySettings(): Promise<PrivacySettings> {
  const response = await fetch('/api/user/privacy-settings');
  if (response.status === 401) {
    return DEMO_SETTINGS;
  }
  if (!response.ok) {
    throw new Error('Failed to fetch privacy settings');
  }
  const data = await response.json();
  return data.settings || DEMO_SETTINGS;
}

// Mutation functions
async function updatePrivacySettings(settings: PrivacySettings): Promise<PrivacySettings> {
  const response = await fetch('/api/user/privacy-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    throw new Error('Failed to save settings');
  }
  return settings;
}

async function blockUser(userId: string): Promise<void> {
  const response = await fetch('/api/user/blocked', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to block user');
  }
}

async function unblockUser(userId: string): Promise<void> {
  const response = await fetch(`/api/user/blocked/${userId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to unblock user');
  }
}

interface ReportUserParams {
  reported_user_id: string;
  reason: string;
  details: string;
}

async function reportUser(params: ReportUserParams): Promise<void> {
  const response = await fetch('/api/user/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to submit report');
  }
}

// Hook for blocked users
export function useBlockedUsers() {
  return useQuery({
    queryKey: privacyKeys.blockedUsers(),
    queryFn: fetchBlockedUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for reports
export function useReports() {
  return useQuery({
    queryKey: privacyKeys.reports(),
    queryFn: fetchReports,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for privacy settings
export function usePrivacySettings() {
  return useQuery({
    queryKey: privacyKeys.settings(),
    queryFn: fetchPrivacySettings,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for updating privacy settings
export function useUpdatePrivacySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePrivacySettings,
    onSuccess: (data) => {
      queryClient.setQueryData(privacyKeys.settings(), data);
    },
    onError: (error) => {
      log.error('Failed to update privacy settings:', error);
    },
  });
}

// Hook for blocking a user
export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: blockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: privacyKeys.blockedUsers() });
    },
    onError: (error) => {
      log.error('Failed to block user:', error);
    },
  });
}

// Hook for unblocking a user
export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: privacyKeys.blockedUsers() });
    },
    onError: (error) => {
      log.error('Failed to unblock user:', error);
    },
  });
}

// Hook for reporting a user
export function useReportUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reportUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: privacyKeys.reports() });
    },
    onError: (error) => {
      log.error('Failed to report user:', error);
    },
  });
}

// Combined hook for all privacy data
export function usePrivacyData() {
  const blockedUsersQuery = useBlockedUsers();
  const reportsQuery = useReports();
  const settingsQuery = usePrivacySettings();
  const updateSettingsMutation = useUpdatePrivacySettings();
  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();
  const reportUserMutation = useReportUser();

  return {
    // Data
    blockedUsers: blockedUsersQuery.data || [],
    reports: reportsQuery.data || [],
    settings: settingsQuery.data || DEMO_SETTINGS,

    // Loading states
    isLoading: blockedUsersQuery.isLoading || reportsQuery.isLoading || settingsQuery.isLoading,
    isBlockedUsersLoading: blockedUsersQuery.isLoading,
    isReportsLoading: reportsQuery.isLoading,
    isSettingsLoading: settingsQuery.isLoading,

    // Error states
    error: blockedUsersQuery.error || reportsQuery.error || settingsQuery.error,

    // Mutations
    updateSettings: updateSettingsMutation.mutateAsync,
    isUpdatingSettings: updateSettingsMutation.isPending,

    blockUser: blockUserMutation.mutateAsync,
    isBlockingUser: blockUserMutation.isPending,

    unblockUser: unblockUserMutation.mutateAsync,
    isUnblockingUser: unblockUserMutation.isPending,

    reportUser: reportUserMutation.mutateAsync,
    isReportingUser: reportUserMutation.isPending,

    // Refetch
    refetch: () => {
      blockedUsersQuery.refetch();
      reportsQuery.refetch();
      settingsQuery.refetch();
    },
  };
}
