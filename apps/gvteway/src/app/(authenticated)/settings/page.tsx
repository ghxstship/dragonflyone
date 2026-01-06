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
  Stack,
  Switch,
  useToast,
  DetailPage,
  Section,
  SectionHeader,
  Grid,
} from "@ghxstship/ui";
import { Bell, Globe, Save, X, Shield, Key } from "lucide-react";
import { useSettingsData, type UserSettings } from "@/hooks/useSettings";

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
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
      toast.success("Saved", "Settings updated successfully");
    } catch {
      toast.error("Error", "Failed to save settings");
    }
  };

  const headerActions = (
    <Stack direction="horizontal" gap={3}>
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
    </Stack>
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
            <Stack gap={6}>
              <Stack direction="horizontal" className="items-center justify-between">
                <Stack gap={0}>
                  <Body className="font-weight-medium text-text-primary">Email Notifications</Body>
                  <Body size="sm" className="text-text-muted">Receive updates about your orders and events</Body>
                </Stack>
                <Switch
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                />
              </Stack>

              <Stack direction="horizontal" className="items-center justify-between">
                <Stack gap={0}>
                  <Body className="font-weight-medium text-text-primary">SMS Notifications</Body>
                  <Body size="sm" className="text-text-muted">Get text alerts for important updates</Body>
                </Stack>
                <Switch
                  checked={settings.smsNotifications}
                  onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                />
              </Stack>

              <Stack direction="horizontal" className="items-center justify-between">
                <Stack gap={0}>
                  <Body className="font-weight-medium text-text-primary">Marketing Emails</Body>
                  <Body size="sm" className="text-text-muted">Receive promotions and recommendations</Body>
                </Stack>
                <Switch
                  checked={settings.marketingEmails}
                  onChange={(e) => setSettings({ ...settings, marketingEmails: e.target.checked })}
                />
              </Stack>
            </Stack>
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
              <Stack gap={2}>
                <Body size="sm" className="text-text-muted">Language</Body>
                <Select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </Select>
              </Stack>

              <Stack gap={2}>
                <Body size="sm" className="text-text-muted">Timezone</Body>
                <Select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </Select>
              </Stack>

              <Stack gap={2}>
                <Body size="sm" className="text-text-muted">Currency</Body>
                <Select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </Select>
              </Stack>
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
              <Stack direction="horizontal" gap={3} className="items-center">
                <Shield className="size-8 text-text-muted" />
                <Stack gap={0}>
                  <Body className="font-weight-medium text-text-primary">Privacy Settings</Body>
                  <Body size="sm" className="text-text-muted">Control your data and privacy</Body>
                </Stack>
              </Stack>
            </Card>
            <Card className="p-4 cursor-pointer hover:ring-2 hover:ring-primary" onClick={() => router.push("/settings/sessions")}>
              <Stack direction="horizontal" gap={3} className="items-center">
                <Key className="size-8 text-text-muted" />
                <Stack gap={0}>
                  <Body className="font-weight-medium text-text-primary">Active Sessions</Body>
                  <Body size="sm" className="text-text-muted">Manage your logged-in devices</Body>
                </Stack>
              </Stack>
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
