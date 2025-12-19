import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface NotificationChannel {
  email: boolean;
  sms: boolean;
  push: boolean;
  in_app: boolean;
}

export interface NotificationPreference {
  category: string;
  subcategory: string;
  description: string;
  channels: NotificationChannel;
  frequency?: 'instant' | 'daily_digest' | 'weekly_digest';
  quiet_hours?: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
}

export interface UserNotificationSettings {
  user_id: string;
  global_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  quiet_hours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  preferences: NotificationPreference[];
  digest_settings: {
    email_digest: 'none' | 'daily' | 'weekly';
    digest_time: string;
    digest_day?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  };
  updated_at: string;
}

export interface UpdatePreferencesInput {
  global_enabled?: boolean;
  email_enabled?: boolean;
  sms_enabled?: boolean;
  push_enabled?: boolean;
  quiet_hours?: UserNotificationSettings['quiet_hours'];
  preferences?: Array<{
    category: string;
    subcategory: string;
    channels: NotificationChannel;
    frequency?: NotificationPreference['frequency'];
  }>;
  digest_settings?: UserNotificationSettings['digest_settings'];
}

async function fetchNotificationPreferences(): Promise<UserNotificationSettings> {
  const response = await fetch('/api/notifications/preferences');
  if (!response.ok) {
    throw new Error('Failed to fetch notification preferences');
  }
  return response.json();
}

async function updateNotificationPreferences(input: UpdatePreferencesInput): Promise<UserNotificationSettings> {
  const response = await fetch('/api/notifications/preferences', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update notification preferences');
  }
  return response.json();
}

async function testNotification(channel: 'email' | 'sms' | 'push'): Promise<{ sent: boolean }> {
  const response = await fetch('/api/notifications/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel }),
  });
  if (!response.ok) {
    throw new Error('Failed to send test notification');
  }
  return response.json();
}

async function unsubscribeFromCategory(category: string): Promise<UserNotificationSettings> {
  const response = await fetch(`/api/notifications/unsubscribe/${category}`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to unsubscribe');
  }
  return response.json();
}

async function resetToDefaults(): Promise<UserNotificationSettings> {
  const response = await fetch('/api/notifications/preferences/reset', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to reset preferences');
  }
  return response.json();
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: fetchNotificationPreferences,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });
}

export function useTestNotification() {
  return useMutation({
    mutationFn: testNotification,
  });
}

export function useUnsubscribeFromCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unsubscribeFromCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });
}

export function useResetNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetToDefaults,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });
}
