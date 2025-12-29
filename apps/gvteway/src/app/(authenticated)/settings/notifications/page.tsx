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
  Switch,
  Select,
  useNotifications,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";
import { Bell, Mail, Smartphone, MessageSquare, Clock, Save, RotateCcw } from "lucide-react";
import { useNotificationSettingsData, type NotificationPreferences } from "@/hooks/useNotificationSettings";

export default function NotificationSettingsPage() {
  const { addNotification } = useNotifications();
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
      addNotification({ type: "success", title: "Saved", message: "Preferences saved successfully" });
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: err instanceof Error ? err.message : "Failed to save preferences" });
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
    <div className="flex gap-3">
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
    </div>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-grey-700">
                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-grey-400" />
                  <div>
                    <Body className="font-weight-medium text-white">Email Notifications</Body>
                    <Body size="sm" className="text-grey-400">Receive notifications via email</Body>
                  </div>
                </div>
                <Switch
                  checked={preferences.email_enabled}
                  onChange={(e) => setPreferences({ ...preferences, email_enabled: e.target.checked })}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-grey-700">
                <div className="flex items-center gap-3">
                  <Smartphone className="size-5 text-grey-400" />
                  <div>
                    <Body className="font-weight-medium text-white">Push Notifications</Body>
                    <Body size="sm" className="text-grey-400">Receive notifications on your device</Body>
                  </div>
                </div>
                <Switch
                  checked={preferences.push_enabled}
                  onChange={(e) => setPreferences({ ...preferences, push_enabled: e.target.checked })}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <MessageSquare className="size-5 text-grey-400" />
                  <div>
                    <Body className="font-weight-medium text-white">SMS Notifications</Body>
                    <Body size="sm" className="text-grey-400">Receive text messages for important updates</Body>
                  </div>
                </div>
                <Switch
                  checked={preferences.sms_enabled}
                  onChange={(e) => setPreferences({ ...preferences, sms_enabled: e.target.checked })}
                />
              </div>
            </div>
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
            <div className="space-y-4">
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
                <div key={item.key} className={`flex items-center justify-between py-3 ${idx < arr.length - 1 ? "border-b border-grey-700" : ""}`}>
                  <div>
                    <Body className="font-weight-medium text-white">{item.label}</Body>
                    <Body size="sm" className="text-grey-400">{item.desc}</Body>
                  </div>
                  <Switch
                    checked={preferences.categories[item.key as keyof NotificationPreferences["categories"]]}
                    onChange={(e) => updateCategory(item.key as keyof NotificationPreferences["categories"], e.target.checked)}
                    disabled={item.disabled}
                  />
                </div>
              ))}
            </div>
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
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Body className="font-weight-medium text-white">Event Reminder Timing</Body>
                  <Body size="sm" className="text-grey-400">How far in advance to remind you</Body>
                </div>
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
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Body className="font-weight-medium text-white">Digest Frequency</Body>
                  <Body size="sm" className="text-grey-400">How often to receive digest emails</Body>
                </div>
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
              </div>
            </div>
          </Card>

          <SectionHeader title="Quiet Hours" description="Pause non-urgent notifications during set times" />
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Body className="font-weight-medium text-white">Enable Quiet Hours</Body>
                  <Body size="sm" className="text-grey-400">Pause notifications during set times</Body>
                </div>
                <Switch
                  checked={preferences.quiet_hours_enabled}
                  onChange={(e) => setPreferences({ ...preferences, quiet_hours_enabled: e.target.checked })}
                />
              </div>

              {preferences.quiet_hours_enabled && (
                <div className="flex gap-4 pt-4 border-t border-grey-700">
                  <div className="flex-1 space-y-2">
                    <Body size="sm" className="text-grey-400">Start Time</Body>
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
                  </div>
                  <div className="flex-1 space-y-2">
                    <Body size="sm" className="text-grey-400">End Time</Body>
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
                  </div>
                </div>
              )}
            </div>
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
