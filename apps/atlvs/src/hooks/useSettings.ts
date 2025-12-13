'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface UserSettings {
  id?: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
  email_notifications: {
    marketing: boolean;
    order_updates: boolean;
    event_reminders: boolean;
    price_alerts: boolean;
    newsletter: boolean;
  };
  push_notifications: {
    enabled: boolean;
    order_updates: boolean;
    event_reminders: boolean;
    price_alerts: boolean;
    messages: boolean;
  };
  sms_notifications: {
    enabled: boolean;
    order_updates: boolean;
    event_reminders: boolean;
  };
  accessibility: {
    reduce_motion: boolean;
    high_contrast: boolean;
    screen_reader_optimized: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_SETTINGS: Omit<UserSettings, 'user_id'> = {
  theme: 'system',
  language: 'en',
  currency: 'USD',
  timezone: 'America/New_York',
  date_format: 'MM/DD/YYYY',
  time_format: '12h',
  email_notifications: {
    marketing: true,
    order_updates: true,
    event_reminders: true,
    price_alerts: true,
    newsletter: true,
  },
  push_notifications: {
    enabled: true,
    order_updates: true,
    event_reminders: true,
    price_alerts: true,
    messages: true,
  },
  sms_notifications: {
    enabled: false,
    order_updates: false,
    event_reminders: false,
  },
  accessibility: {
    reduce_motion: false,
    high_contrast: false,
    screen_reader_optimized: false,
  },
};

export function useSettings(userId: string) {
  return useQuery({
    queryKey: ['settings', userId],
    queryFn: async () => {
      const response = await fetch(`/api/settings?user_id=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      const data = await response.json();
      return data.settings as UserSettings;
    },
    enabled: !!userId,
    placeholderData: { user_id: userId, ...DEFAULT_SETTINGS },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<UserSettings> & { user_id: string }) => {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) {
        throw new Error('Failed to update settings');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settings', variables.user_id] });
    },
  });
}

export function useSaveSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: UserSettings) => {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settings', variables.user_id] });
    },
  });
}
