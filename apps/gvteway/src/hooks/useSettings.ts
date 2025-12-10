'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface UserSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  language: string;
  timezone: string;
  currency: string;
}

const DEFAULT_SETTINGS: UserSettings = {
  emailNotifications: true,
  smsNotifications: false,
  marketingEmails: true,
  language: 'en',
  timezone: 'America/New_York',
  currency: 'USD',
};

export const settingsKeys = {
  all: ['settings'] as const,
  user: () => [...settingsKeys.all, 'user'] as const,
};

export function useUserSettings() {
  return useQuery({
    queryKey: settingsKeys.user(),
    queryFn: async () => {
      const response = await fetch('/api/user/settings');
      if (!response.ok) return DEFAULT_SETTINGS;
      const data = await response.json();
      return { ...DEFAULT_SETTINGS, ...data.settings };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: UserSettings) => {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('Failed to save settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}

export function useSettingsData() {
  const settingsQuery = useUserSettings();
  const saveMutation = useSaveSettings();

  return {
    settings: settingsQuery.data || DEFAULT_SETTINGS,
    isLoading: settingsQuery.isLoading,
    error: settingsQuery.error,
    saveSettings: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
