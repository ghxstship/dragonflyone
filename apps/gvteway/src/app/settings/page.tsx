'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConsumerNavigationPublic } from '@/components/navigation';
import {
  Container,
  Section,
  Display,
  H2,
  H3,
  Body,
  Button,
  Card,
  Select,
  Stack,
  Switch,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Kicker,
  Label,
  useNotifications,
} from '@ghxstship/ui';
import { Bell, Globe, Save, X } from 'lucide-react';

/**
 * Settings Page - Bold Contemporary Pop Art Adventure
 * Hard offset shadows, 2px+ borders, bounce animations
 */
export default function SettingsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    language: 'en',
    timezone: 'America/New_York',
    currency: 'USD',
  });

  const handleSave = async () => {
    try {
      await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      addNotification({ type: 'success', title: 'Saved', message: 'Settings updated successfully' });
    } catch {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to save settings' });
    }
  };

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Account">
            <FooterLink href="/profile">Profile</FooterLink>
            <FooterLink href="/settings">Settings</FooterLink>
            <FooterLink href="/wallet">Wallet</FooterLink>
          </FooterColumn>
          <FooterColumn title="Discover">
            <FooterLink href="/events">Browse Events</FooterLink>
            <FooterLink href="/venues">Find Venues</FooterLink>
            <FooterLink href="/artists">Artists</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        {/* Grid Pattern Background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(#fff 1px, transparent 1px),
              linear-gradient(90deg, #fff 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Account</Kicker>
              <H2 size="lg" className="text-white">Settings</H2>
              <Body className="text-on-dark-muted">Manage your account preferences and notifications</Body>
            </Stack>

            <Stack gap={6} className="max-w-3xl">
              {/* Notifications Card */}
              <Card inverted variant="elevated" className="p-6">
                <Stack gap={6}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Bell className="size-5 text-on-dark-muted" />
                    <H3 className="text-white">Notifications</H3>
                  </Stack>
                  <Stack gap={4}>
                    <Stack gap={2} direction="horizontal" className="items-center justify-between">
                      <Stack gap={1}>
                        <Body className="text-white">Email Notifications</Body>
                        <Label size="xs" className="text-on-dark-disabled">Receive updates about your orders and events</Label>
                      </Stack>
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                      />
                    </Stack>

                    <Stack gap={2} direction="horizontal" className="items-center justify-between">
                      <Stack gap={1}>
                        <Body className="text-white">SMS Notifications</Body>
                        <Label size="xs" className="text-on-dark-disabled">Get text alerts for important updates</Label>
                      </Stack>
                      <Switch
                        checked={settings.smsNotifications}
                        onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                      />
                    </Stack>

                    <Stack gap={2} direction="horizontal" className="items-center justify-between">
                      <Stack gap={1}>
                        <Body className="text-white">Marketing Emails</Body>
                        <Label size="xs" className="text-on-dark-disabled">Receive promotions and recommendations</Label>
                      </Stack>
                      <Switch
                        checked={settings.marketingEmails}
                        onChange={(e) => setSettings({ ...settings, marketingEmails: e.target.checked })}
                      />
                    </Stack>
                  </Stack>
                </Stack>
              </Card>

              {/* Preferences Card */}
              <Card inverted variant="elevated" className="p-6">
                <Stack gap={6}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Globe className="size-5 text-on-dark-muted" />
                    <H3 className="text-white">Preferences</H3>
                  </Stack>
                  <Stack gap={4}>
                    <Stack gap={2}>
                      <Label size="xs" className="text-on-dark-muted">Language</Label>
                      <Select
                        value={settings.language}
                        onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                        inverted
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                      </Select>
                    </Stack>

                    <Stack gap={2}>
                      <Label size="xs" className="text-on-dark-muted">Timezone</Label>
                      <Select
                        value={settings.timezone}
                        onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                        inverted
                      >
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                      </Select>
                    </Stack>

                    <Stack gap={2}>
                      <Label size="xs" className="text-on-dark-muted">Currency</Label>
                      <Select
                        value={settings.currency}
                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                        inverted
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </Select>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>

              {/* Action Buttons */}
              <Stack gap={4} direction="horizontal">
                <Button 
                  variant="solid" 
                  inverted
                  onClick={handleSave}
                  icon={<Save className="size-4" />}
                  iconPosition="left"
                >
                  Save Changes
                </Button>
                <Button 
                  variant="outlineInk" 
                  onClick={() => router.push('/profile')}
                  icon={<X className="size-4" />}
                  iconPosition="left"
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
