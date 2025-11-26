'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../components/navigation';
import {
  Container,
  Section,
  H1,
  H2,
  Body,
  Button,
  Card,
  Field,
  Input,
  Select,
  Grid,
  Stack,
  Switch,
  Label,
} from '@ghxstship/ui';

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    language: 'en',
    timezone: 'America/New_York',
    currency: 'USD',
  });

  const handleSave = async () => {
    await fetch('/api/user/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
  };

  return (
    <Section className="min-h-screen bg-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2} className="border-b-2 border-black pb-8">
            <H1>Settings</H1>
            <Body className="text-grey-600">Manage your account preferences</Body>
          </Stack>

        <Grid cols={1} className="max-w-3xl">
          <Card className="p-6 mb-6">
            <H2 className="mb-6">NOTIFICATIONS</H2>
            
            <Stack gap={4}>
              <Stack gap={2} direction="horizontal" className="justify-between items-center">
                <Body>Email Notifications</Body>
                <Switch
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                />
              </Stack>

              <Stack gap={2} direction="horizontal" className="justify-between items-center">
                <Body>SMS Notifications</Body>
                <Switch
                  checked={settings.smsNotifications}
                  onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                />
              </Stack>

              <Stack gap={2} direction="horizontal" className="justify-between items-center">
                <Body>Marketing Emails</Body>
                <Switch
                  checked={settings.marketingEmails}
                  onChange={(e) => setSettings({ ...settings, marketingEmails: e.target.checked })}
                />
              </Stack>
            </Stack>
          </Card>

          <Card className="p-6 mb-6">
            <H2 className="mb-6">PREFERENCES</H2>
            
            <Stack gap={6}>
              <Field label="Language">
                <Select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </Select>
              </Field>

              <Field label="Timezone">
                <Select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </Select>
              </Field>

              <Field label="Currency">
                <Select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </Select>
              </Field>
            </Stack>
          </Card>

          <Stack gap={4} direction="horizontal">
            <Button variant="solid" onClick={handleSave}>
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => router.push('/profile')}>
              Cancel
            </Button>
          </Stack>
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
