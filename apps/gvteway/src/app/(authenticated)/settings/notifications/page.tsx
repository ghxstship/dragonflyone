"use client";

/**
 * GVTEWAY Notification Settings Page
 * Control how and when you receive notifications
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import {
  Body,
  Button,
  Card,
  Stack,
  Switch,
  Select,
  SettingsRow,
  SettingsGroup,
  useToast,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";
import { Bell, Mail, Smartphone, MessageSquare, Clock, Save, RotateCcw } from "lucide-react";
import { useNotificationSettingsData, type NotificationPreferences } from "@/hooks/useNotificationSettings";

export default function NotificationSettingsPage() {
  const toast = useToast();
  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences | null>(null);

  const {
    preferences: fetchedPreferences,
    isLoading: loading,
    error,
    savePreferences,
    isSaving: saving,
    refetch,
  } = useNotificationSettingsData();

  const preferences = localPreferences || fetchedPreferences;

  const handleSave = async () => {
    try {
      await savePreferences(preferences);
      toast.success("Saved", "Preferences saved successfully");
    } catch (err) {
      toast.error("Error", err instanceof Error ? err.message : "Failed to save preferences");
    }
  };

  const updateCategory = (key: keyof NotificationPreferences["categories"], value: boolean) => {
    setLocalPreferences((prev) => ({
      ...(prev || preferences),
      categories: {
        ...(prev || preferences).categories,
        [key]: value,
      },
    }));
  };

  const setPreferences = (newPrefs: NotificationPreferences) => {
    setLocalPreferences(newPrefs);
  };

  const headerActions = (
    <Stack direction="horizontal" gap={3}>
      <Button
        variant="solid"
        onClick={handleSave}
        disabled={saving}
        icon={<Save className="size-4" />}
        iconPosition="left"
      >
        {saving ? "Saving..." : "Save Preferences"}
      </Button>
      <Button
        variant="outline"
        onClick={() => { setLocalPreferences(null); refetch(); }}
        icon={<RotateCcw className="size-4" />}
        iconPosition="left"
      >
        Reset
      </Button>
    </Stack>
  );

  const tabs = [
    {
      id: "channels",
      label: "Channels",
      icon: <Bell className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Notification Channels" description="Choose how you receive notifications" />
          <Card className="p-6">
            <SettingsGroup>
              <SettingsRow
                label="Email Notifications"
                description="Receive notifications via email"
                icon={<Mail className="size-5" />}
                bordered
                control={
                  <Switch
                    checked={preferences.email_enabled}
                    onChange={(e) => setPreferences({ ...preferences, email_enabled: e.target.checked })}
                  />
                }
              />
              <SettingsRow
                label="Push Notifications"
                description="Receive notifications on your device"
                icon={<Smartphone className="size-5" />}
                bordered
                control={
                  <Switch
                    checked={preferences.push_enabled}
                    onChange={(e) => setPreferences({ ...preferences, push_enabled: e.target.checked })}
                  />
                }
              />
              <SettingsRow
                label="SMS Notifications"
                description="Receive text messages for important updates"
                icon={<MessageSquare className="size-5" />}
                control={
                  <Switch
                    checked={preferences.sms_enabled}
                    onChange={(e) => setPreferences({ ...preferences, sms_enabled: e.target.checked })}
                  />
                }
              />
            </SettingsGroup>
          </Card>
        </Section>
      ),
    },
    {
      id: "types",
      label: "Types",
      icon: <MessageSquare className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Notification Types" description="Choose which notifications to receive" />
          <Card className="p-6">
            <SettingsGroup>
              {[
                { key: "order_updates", label: "Order Updates", desc: "Confirmations, ticket delivery, and changes" },
                { key: "event_reminders", label: "Event Reminders", desc: "Reminders before your upcoming events" },
                { key: "price_alerts", label: "Price Alerts", desc: "When ticket prices drop to your target" },
                { key: "saved_search_alerts", label: "Saved Search Alerts", desc: "New events matching your saved searches" },
                { key: "artist_announcements", label: "Artist Announcements", desc: "New events from artists you follow" },
                { key: "venue_announcements", label: "Venue Announcements", desc: "New events at venues you follow" },
                { key: "promotions", label: "Promotions & Offers", desc: "Discounts, deals, and special offers" },
                { key: "community_updates", label: "Community Updates", desc: "Activity from groups and forums" },
                { key: "account_security", label: "Account Security", desc: "Login alerts and security notifications", disabled: true },
              ].map((item, idx, arr) => (
                <SettingsRow
                  key={item.key}
                  label={item.label}
                  description={item.desc}
                  bordered={idx < arr.length - 1}
                  disabled={item.disabled}
                  control={
                    <Switch
                      checked={preferences.categories[item.key as keyof NotificationPreferences["categories"]]}
                      onChange={(e) => updateCategory(item.key as keyof NotificationPreferences["categories"], e.target.checked)}
                      disabled={item.disabled}
                    />
                  }
                />
              ))}
            </SettingsGroup>
          </Card>
        </Section>
      ),
    },
    {
      id: "timing",
      label: "Timing",
      icon: <Clock className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Timing Preferences" description="Control when you receive notifications" />
          <Card className="p-6 mb-6">
            <SettingsGroup>
              <SettingsRow
                label="Event Reminder Timing"
                description="How far in advance to remind you"
                bordered
                control={
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
                }
              />
              <SettingsRow
                label="Digest Frequency"
                description="How often to receive digest emails"
                control={
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
                }
              />
            </SettingsGroup>
          </Card>

          <SectionHeader title="Quiet Hours" description="Pause non-urgent notifications during set times" />
          <Card className="p-6">
            <SettingsGroup>
              <SettingsRow
                label="Enable Quiet Hours"
                description="Pause notifications during set times"
                bordered={preferences.quiet_hours_enabled}
                control={
                  <Switch
                    checked={preferences.quiet_hours_enabled}
                    onChange={(e) => setPreferences({ ...preferences, quiet_hours_enabled: e.target.checked })}
                  />
                }
              />
              {preferences.quiet_hours_enabled && (
                <Stack direction="horizontal" gap={4} className="pt-4">
                  <Stack gap={2} className="flex-1">
                    <Body size="sm" className="text-on-dark-muted">Start Time</Body>
                    <Select
                      value={preferences.quiet_hours_start}
                      onChange={(e) => setPreferences({ ...preferences, quiet_hours_start: e.target.value })}
                    >
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, "0");
                        return (
                          <option key={hour} value={`${hour}:00`}>
                            {hour}:00
                          </option>
                        );
                      })}
                    </Select>
                  </Stack>
                  <Stack gap={2} className="flex-1">
                    <Body size="sm" className="text-on-dark-muted">End Time</Body>
                    <Select
                      value={preferences.quiet_hours_end}
                      onChange={(e) => setPreferences({ ...preferences, quiet_hours_end: e.target.value })}
                    >
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, "0");
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
            </SettingsGroup>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Settings",
        title: "Notification Settings",
        description: "Control how and when you receive notifications",
      }}
      loading={loading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
      actions={headerActions}
      backButton={{
        label: "Settings",
        href: "/settings",
      }}
    />
  );
}
