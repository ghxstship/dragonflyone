"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useNotifications,
  Body,
  Button,
  Switch,
  Select,
  Label,
  Container,
  Stack,
  Grid,
  Card,
  Section,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";
import { AtlvsAppLayout } from "../../components/app-layout";

export default function SettingsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: false,
    projectUpdates: true,
    financialAlerts: true,
    teamActivity: false,
  });

  const [preferences, setPreferences] = useState({
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    currency: "USD",
    language: "en",
  });

  return (
    <AtlvsAppLayout>
      <EnterprisePageHeader
        title="Settings"
        subtitle="Configure your account preferences and notifications"
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Settings' }]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

          <Section border noPadding title="Notification Preferences">
            <Stack gap={4}>
              <Card className="flex items-center justify-between border-ink-800 bg-transparent p-spacing-4">
                <Stack gap={1}>
                  <Body className="text-white">Email Notifications</Body>
                  <Body className="text-body-sm text-ink-400">Receive updates via email</Body>
                </Stack>
                <Switch
                  checked={notificationSettings.email}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, email: e.target.checked })}
                />
              </Card>
              <Card className="flex items-center justify-between border-ink-800 bg-transparent p-spacing-4">
                <Stack gap={1}>
                  <Body className="text-white">SMS Notifications</Body>
                  <Body className="text-body-sm text-ink-400">Receive urgent alerts via SMS</Body>
                </Stack>
                <Switch
                  checked={notificationSettings.sms}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, sms: e.target.checked })}
                />
              </Card>
              <Card className="flex items-center justify-between border-ink-800 bg-transparent p-spacing-4">
                <Stack gap={1}>
                  <Body className="text-white">Project Updates</Body>
                  <Body className="text-body-sm text-ink-400">Get notified about project changes</Body>
                </Stack>
                <Switch
                  checked={notificationSettings.projectUpdates}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, projectUpdates: e.target.checked })}
                />
              </Card>
              <Card className="flex items-center justify-between border-ink-800 bg-transparent p-spacing-4">
                <Stack gap={1}>
                  <Body className="text-white">Financial Alerts</Body>
                  <Body className="text-body-sm text-ink-400">Budget and payment notifications</Body>
                </Stack>
                <Switch
                  checked={notificationSettings.financialAlerts}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, financialAlerts: e.target.checked })}
                />
              </Card>
            </Stack>
          </Section>

          <Section border noPadding title="General Preferences">
            <Grid cols={2} gap={6}>
              <Stack gap={2}>
                <Label>Timezone</Label>
                <Select
                  value={preferences.timezone}
                  onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                  inverted
                  fullWidth
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                </Select>
              </Stack>
              <Stack gap={2}>
                <Label>Date Format</Label>
                <Select
                  value={preferences.dateFormat}
                  onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                  inverted
                  fullWidth
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </Select>
              </Stack>
              <Stack gap={2}>
                <Label>Currency</Label>
                <Select
                  value={preferences.currency}
                  onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                  inverted
                  fullWidth
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </Select>
              </Stack>
              <Stack gap={2}>
                <Label>Language</Label>
                <Select
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  inverted
                  fullWidth
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </Select>
              </Stack>
            </Grid>
          </Section>

          <Section border noPadding title="Security">
            <Stack gap={4}>
              <Button variant="outlineInk" fullWidth className="justify-start text-left" onClick={() => router.push('/settings/password')}>
                <Stack gap={1}>
                  <Body className="font-heading uppercase tracking-widest">Change Password</Body>
                  <Body className="text-body-sm text-ink-400">Update your account password</Body>
                </Stack>
              </Button>
              <Button variant="outlineInk" fullWidth className="justify-start text-left" onClick={() => router.push('/settings/2fa')}>
                <Stack gap={1}>
                  <Body className="font-heading uppercase tracking-widest">Two-Factor Authentication</Body>
                  <Body className="text-body-sm text-ink-400">Add an extra layer of security</Body>
                </Stack>
              </Button>
              <Button variant="outlineInk" fullWidth className="justify-start text-left" onClick={() => router.push('/settings/sessions')}>
                <Stack gap={1}>
                  <Body className="font-heading uppercase tracking-widest">Active Sessions</Body>
                  <Body className="text-body-sm text-ink-400">Manage devices and active logins</Body>
                </Stack>
              </Button>
            </Stack>
          </Section>

            <Stack gap={3} direction="horizontal">
              <Button variant="outlineWhite" onClick={() => addNotification({ type: 'success', title: 'Saved', message: 'Settings saved successfully' })}>Save Changes</Button>
              <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push('/dashboard')}>Cancel</Button>
            </Stack>
          </Stack>
        </Container>
      </MainContent>
    </AtlvsAppLayout>
  );
}
