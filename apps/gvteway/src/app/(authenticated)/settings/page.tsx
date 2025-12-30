"use client";

/**
 * GVTEWAY Settings Page
 * Manage account preferences and notifications
 * Uses DetailPage template for consistent layout
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Body,
  Button,
  Card,
  Select,
  Switch,
  useNotifications,
  DetailPage,
  Section,
  SectionHeader,
  Grid,
} from "@ghxstship/ui";
import { Bell, Globe, Save, X, Shield, Key } from "lucide-react";
import { useSettingsData, type UserSettings } from "@/hooks/useSettings";

export default function SettingsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [localSettings, setLocalSettings] = useState<UserSettings | null>(null);

  const {
    settings: fetchedSettings,
    saveSettings,
    isLoading,
    error,
    refetch,
  } = useSettingsData();

  const settings = localSettings || fetchedSettings;

  useEffect(() => {
    if (fetchedSettings && !localSettings) {
      setLocalSettings(fetchedSettings);
    }
  }, [fetchedSettings, localSettings]);

  const setSettings = (newSettings: UserSettings) => {
    setLocalSettings(newSettings);
  };

  const handleSave = async () => {
    try {
      await saveSettings(settings);
      addNotification({ type: "success", title: "Saved", message: "Settings updated successfully" });
    } catch {
      addNotification({ type: "error", title: "Error", message: "Failed to save settings" });
    }
  };

  const headerActions = (
    <div className="flex gap-3">
      <Button
        variant="solid"
        onClick={handleSave}
        icon={<Save className="size-4" />}
        iconPosition="left"
      >
        Save Changes
      </Button>
      <Button
        variant="outline"
        onClick={() => router.push("/account")}
        icon={<X className="size-4" />}
        iconPosition="left"
      >
        Cancel
      </Button>
    </div>
  );

  const tabs = [
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Notification Preferences" description="Control how you receive updates" />
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Body className="font-weight-medium text-white">Email Notifications</Body>
                  <Body size="sm" className="text-on-dark-muted">Receive updates about your orders and events</Body>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Body className="font-weight-medium text-white">SMS Notifications</Body>
                  <Body size="sm" className="text-on-dark-muted">Get text alerts for important updates</Body>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Body className="font-weight-medium text-white">Marketing Emails</Body>
                  <Body size="sm" className="text-on-dark-muted">Receive promotions and recommendations</Body>
                </div>
                <Switch
                  checked={settings.marketingEmails}
                  onChange={(e) => setSettings({ ...settings, marketingEmails: e.target.checked })}
                />
              </div>
            </div>
          </Card>
        </Section>
      ),
    },
    {
      id: "preferences",
      label: "Preferences",
      icon: <Globe className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Regional Preferences" description="Customize your language and regional settings" />
          <Card className="p-6">
            <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Body size="sm" className="text-on-dark-muted">Language</Body>
                <Select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Body size="sm" className="text-on-dark-muted">Timezone</Body>
                <Select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Body size="sm" className="text-on-dark-muted">Currency</Body>
                <Select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </Select>
              </div>
            </Grid>
          </Card>
        </Section>
      ),
    },
    {
      id: "security",
      label: "Security",
      icon: <Shield className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Security Settings" description="Manage your account security" />
          <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
            <Card className="p-4 cursor-pointer hover:ring-2 hover:ring-primary" onClick={() => router.push("/settings/privacy")}>
              <div className="flex items-center gap-3">
                <Shield className="size-8 text-on-dark-muted" />
                <div>
                  <Body className="font-weight-medium text-white">Privacy Settings</Body>
                  <Body size="sm" className="text-on-dark-muted">Control your data and privacy</Body>
                </div>
              </div>
            </Card>
            <Card className="p-4 cursor-pointer hover:ring-2 hover:ring-primary" onClick={() => router.push("/settings/sessions")}>
              <div className="flex items-center gap-3">
                <Key className="size-8 text-on-dark-muted" />
                <div>
                  <Body className="font-weight-medium text-white">Active Sessions</Body>
                  <Body size="sm" className="text-on-dark-muted">Manage your logged-in devices</Body>
                </div>
              </div>
            </Card>
          </Grid>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Account",
        title: "Settings",
        description: "Manage your account preferences and notifications",
      }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
      actions={headerActions}
      backButton={{
        label: "Account",
        href: "/account",
      }}
    />
  );
}
