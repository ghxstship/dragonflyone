'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navigation } from '../../../components/navigation';
import {
  Container,
  Section,
  H1,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Stack,
  Switch,
  Select,
  Alert,
  LoadingSpinner,
} from '@ghxstship/ui';

interface NotificationPreferences {
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

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/notification-preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences({ ...defaultPreferences, ...data.preferences });
      }
    } catch (err) {
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        setSuccess('Preferences saved successfully');
      } else {
        setError('Failed to save preferences');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const updateCategory = (key: keyof NotificationPreferences['categories'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [key]: value,
      },
    }));
  };

  if (loading) {
    return (
      <Section className="min-h-screen bg-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading notification settings..." />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2} className="border-b-2 border-black pb-8">
            <H1>Notification Settings</H1>
            <Body className="text-grey-600">
              Control how and when you receive notifications
            </Body>
          </Stack>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="mb-6">
              {success}
            </Alert>
          )}
          <Card className="p-6">
            <H2 className="mb-6">NOTIFICATION CHANNELS</H2>
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between items-center py-3 border-b border-gray-200">
                <Stack>
                  <Body className="font-medium">Email Notifications</Body>
                  <Body className="text-sm text-gray-500">Receive notifications via email</Body>
                </Stack>
                <Switch
                  checked={preferences.email_enabled}
                  onChange={(e) => setPreferences({ ...preferences, email_enabled: e.target.checked })}
                />
              </Stack>

              <Stack direction="horizontal" className="justify-between items-center py-3 border-b border-gray-200">
                <Stack>
                  <Body className="font-medium">Push Notifications</Body>
                  <Body className="text-sm text-gray-500">Receive notifications on your device</Body>
                </Stack>
                <Switch
                  checked={preferences.push_enabled}
                  onChange={(e) => setPreferences({ ...preferences, push_enabled: e.target.checked })}
                />
              </Stack>

              <Stack direction="horizontal" className="justify-between items-center py-3">
                <Stack>
                  <Body className="font-medium">SMS Notifications</Body>
                  <Body className="text-sm text-gray-500">Receive text messages for important updates</Body>
                </Stack>
                <Switch
                  checked={preferences.sms_enabled}
                  onChange={(e) => setPreferences({ ...preferences, sms_enabled: e.target.checked })}
                />
              </Stack>
            </Stack>
          </Card>

          <Card className="p-6">
            <H2 className="mb-6">NOTIFICATION TYPES</H2>
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between items-center py-3 border-b border-gray-200">
                <Stack>
                  <Body className="font-medium">Order Updates</Body>
                  <Body className="text-sm text-gray-500">Confirmations, ticket delivery, and changes</Body>
                </Stack>
                <Switch
                  checked={preferences.categories.order_updates}
                  onChange={(e) => updateCategory('order_updates', e.target.checked)}
                />
              </Stack>

              <Stack direction="horizontal" className="justify-between items-center py-3 border-b border-gray-200">
                <Stack>
                  <Body className="font-medium">Event Reminders</Body>
                  <Body className="text-sm text-gray-500">Reminders before your upcoming events</Body>
                </Stack>
                <Switch
                  checked={preferences.categories.event_reminders}
                  onChange={(e) => updateCategory('event_reminders', e.target.checked)}
                />
              </Stack>

              <Stack direction="horizontal" className="justify-between items-center py-3 border-b border-gray-200">
                <Stack>
                  <Body className="font-medium">Price Alerts</Body>
                  <Body className="text-sm text-gray-500">When ticket prices drop to your target</Body>
                </Stack>
                <Switch
                  checked={preferences.categories.price_alerts}
                  onChange={(e) => updateCategory('price_alerts', e.target.checked)}
                />
              </Stack>

              <Stack direction="horizontal" className="justify-between items-center py-3 border-b border-gray-200">
                <Stack>
                  <Body className="font-medium">Saved Search Alerts</Body>
                  <Body className="text-sm text-gray-500">New events matching your saved searches</Body>
                </Stack>
                <Switch
                  checked={preferences.categories.saved_search_alerts}
                  onChange={(e) => updateCategory('saved_search_alerts', e.target.checked)}
                />
              </Stack>

              <Stack direction="horizontal" className="justify-between items-center py-3 border-b border-gray-200">
                <Stack>
                  <Body className="font-medium">Artist Announcements</Body>
                  <Body className="text-sm text-gray-500">New events from artists you follow</Body>
                </Stack>
                <Switch
                  checked={preferences.categories.artist_announcements}
                  onChange={(e) => updateCategory('artist_announcements', e.target.checked)}
                />
              </Stack>

              <Stack direction="horizontal" className="justify-between items-center py-3 border-b border-gray-200">
                <Stack>
                  <Body className="font-medium">Venue Announcements</Body>
                  <Body className="text-sm text-gray-500">New events at venues you follow</Body>
                </Stack>
                <Switch
                  checked={preferences.categories.venue_announcements}
                  onChange={(e) => updateCategory('venue_announcements', e.target.checked)}
                />
              </Stack>

              <Stack direction="horizontal" className="justify-between items-center py-3 border-b border-gray-200">
                <Stack>
                  <Body className="font-medium">Promotions & Offers</Body>
                  <Body className="text-sm text-gray-500">Discounts, deals, and special offers</Body>
                </Stack>
                <Switch
                  checked={preferences.categories.promotions}
                  onChange={(e) => updateCategory('promotions', e.target.checked)}
                />
              </Stack>

              <Stack direction="horizontal" className="justify-between items-center py-3 border-b border-gray-200">
                <Stack>
                  <Body className="font-medium">Community Updates</Body>
                  <Body className="text-sm text-gray-500">Activity from groups and forums</Body>
                </Stack>
                <Switch
                  checked={preferences.categories.community_updates}
                  onChange={(e) => updateCategory('community_updates', e.target.checked)}
                />
              </Stack>

              <Stack direction="horizontal" className="justify-between items-center py-3">
                <Stack>
                  <Body className="font-medium">Account Security</Body>
                  <Body className="text-sm text-gray-500">Login alerts and security notifications</Body>
                </Stack>
                <Switch
                  checked={preferences.categories.account_security}
                  onChange={(e) => updateCategory('account_security', e.target.checked)}
                  disabled
                />
              </Stack>
            </Stack>
          </Card>

          <Card className="p-6">
            <H2 className="mb-6">TIMING PREFERENCES</H2>
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between items-center">
                <Stack>
                  <Body className="font-medium">Event Reminder Timing</Body>
                  <Body className="text-sm text-gray-500">How far in advance to remind you</Body>
                </Stack>
                <Select
                  value={preferences.reminder_timing}
                  onChange={(e) => setPreferences({ ...preferences, reminder_timing: e.target.value })}
                  className="w-48"
                >
                  <option value="1h">1 hour before</option>
                  <option value="3h">3 hours before</option>
                  <option value="24h">1 day before</option>
                  <option value="48h">2 days before</option>
                  <option value="1w">1 week before</option>
                </Select>
              </Stack>

              <Stack direction="horizontal" className="justify-between items-center">
                <Stack>
                  <Body className="font-medium">Digest Frequency</Body>
                  <Body className="text-sm text-gray-500">How often to receive digest emails</Body>
                </Stack>
                <Select
                  value={preferences.digest_frequency}
                  onChange={(e) => setPreferences({ ...preferences, digest_frequency: e.target.value })}
                  className="w-48"
                >
                  <option value="instant">Instant</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="never">Never</option>
                </Select>
              </Stack>
            </Stack>
          </Card>

          <Card className="p-6">
            <H2 className="mb-6">QUIET HOURS</H2>
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between items-center">
                <Stack>
                  <Body className="font-medium">Enable Quiet Hours</Body>
                  <Body className="text-sm text-gray-500">Pause non-urgent notifications during set times</Body>
                </Stack>
                <Switch
                  checked={preferences.quiet_hours_enabled}
                  onChange={(e) => setPreferences({ ...preferences, quiet_hours_enabled: e.target.checked })}
                />
              </Stack>

              {preferences.quiet_hours_enabled && (
                <Stack direction="horizontal" gap={4}>
                  <Stack className="flex-1">
                    <Label>Start Time</Label>
                    <Select
                      value={preferences.quiet_hours_start}
                      onChange={(e) => setPreferences({ ...preferences, quiet_hours_start: e.target.value })}
                    >
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <option key={hour} value={`${hour}:00`}>
                            {hour}:00
                          </option>
                        );
                      })}
                    </Select>
                  </Stack>
                  <Stack className="flex-1">
                    <Label>End Time</Label>
                    <Select
                      value={preferences.quiet_hours_end}
                      onChange={(e) => setPreferences({ ...preferences, quiet_hours_end: e.target.value })}
                    >
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <option key={hour} value={`${hour}:00`}>
                            {hour}:00
                          </option>
                        );
                      })}
                    </Select>
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Card>

          <Stack direction="horizontal" gap={4}>
            <Button variant="solid" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
            <Button variant="outline" onClick={fetchPreferences}>
              Reset
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
