'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  categories: {
    order_updates: boolean;
    event_reminders: boolean;
    price_alerts: boolean;
    saved_search_alerts: boolean;
    artist_announcements: boolean;
    venue_announcements: boolean;
    promotions: boolean;
    community_updates: boolean;
    account_security: boolean;
  };
  reminder_timing: string;
  digest_frequency: string;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

const defaultPreferences: NotificationPreferences = {
  email_enabled: true,
  push_enabled: true,
  sms_enabled: false,
  categories: {
    order_updates: true,
    event_reminders: true,
    price_alerts: true,
    saved_search_alerts: true,
    artist_announcements: true,
    venue_announcements: true,
    promotions: false,
    community_updates: true,
    account_security: true,
  },
  reminder_timing: '24h',
  digest_frequency: 'daily',
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
};

export const notificationSettingsKeys = {
  all: ['notification-settings'] as const,
  preferences: () => [...notificationSettingsKeys.all, 'preferences'] as const,
};

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationSettingsKeys.preferences(),
    queryFn: async () => {
      const response = await fetch('/api/user/notification-preferences');
      if (!response.ok) return defaultPreferences;
      const data = await response.json();
      return { ...defaultPreferences, ...data.preferences };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: NotificationPreferences) => {
      const response = await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      if (!response.ok) throw new Error('Failed to save preferences');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationSettingsKeys.all });
    },
  });
}

export function useNotificationSettingsData() {
  const preferencesQuery = useNotificationPreferences();
  const saveMutation = useSaveNotificationPreferences();

  return {
    preferences: preferencesQuery.data || defaultPreferences,
    isLoading: preferencesQuery.isLoading,
    error: preferencesQuery.error,
    refetch: preferencesQuery.refetch,
    savePreferences: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
