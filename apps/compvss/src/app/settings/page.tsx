"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@ghxstship/ui";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  H2,
  Body,
  Button,
  Switch,
  Select,
  Container,
  Stack,
  Grid,
  Card,
  Section,
  PageLayout,
  SectionHeader,
} from "@ghxstship/ui";

/**
 * COMPVSS Settings Page - Bold Contemporary Pop Art Adventure
 * Hard offset shadows, 2px+ borders, bounce animations
 */
export default function SettingsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [notifications, setNotifications] = useState({
    crewAlerts: true,
    equipmentAlerts: true,
    scheduleChanges: true,
    weatherAlerts: true,
  });

  return (
    <PageLayout background="black" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            {/* Page Header - Bold Contemporary Pop Art Adventure */}
            <SectionHeader
              kicker="COMPVSS"
              title="Production Settings"
              description="Configure alerts, radio channels, and safety settings"
              colorScheme="on-dark"
              gap="lg"
            />

          <Card className="p-spacing-6 border-2 border-ink-800 bg-transparent">
            <Stack gap={6}>
              <H2>Alert Preferences</H2>
              <Stack gap={4}>
                <Card className="p-spacing-4 border border-ink-800 bg-transparent">
                  <Stack gap={4} direction="horizontal" className="justify-between items-center">
                    <Stack gap={1}>
                      <Body className="text-white">Crew Alerts</Body>
                      <Body className="text-body-sm text-ink-400">Get notified about crew availability changes</Body>
                    </Stack>
                    <Switch
                      checked={notifications.crewAlerts}
                      onChange={(e) => setNotifications({ ...notifications, crewAlerts: e.target.checked })}
                    />
                  </Stack>
                </Card>
                <Card className="p-spacing-4 border border-ink-800 bg-transparent">
                  <Stack gap={4} direction="horizontal" className="justify-between items-center">
                    <Stack gap={1}>
                      <Body className="text-white">Equipment Alerts</Body>
                      <Body className="text-body-sm text-ink-400">Maintenance and availability notifications</Body>
                    </Stack>
                    <Switch
                      checked={notifications.equipmentAlerts}
                      onChange={(e) => setNotifications({ ...notifications, equipmentAlerts: e.target.checked })}
                    />
                  </Stack>
                </Card>
                <Card className="p-spacing-4 border border-ink-800 bg-transparent">
                  <Stack gap={4} direction="horizontal" className="justify-between items-center">
                    <Stack gap={1}>
                      <Body className="text-white">Schedule Changes</Body>
                      <Body className="text-body-sm text-ink-400">Project timeline and schedule updates</Body>
                    </Stack>
                    <Switch
                      checked={notifications.scheduleChanges}
                      onChange={(e) => setNotifications({ ...notifications, scheduleChanges: e.target.checked })}
                    />
                  </Stack>
                </Card>
                <Card className="p-spacing-4 border border-ink-800 bg-transparent">
                  <Stack gap={4} direction="horizontal" className="justify-between items-center">
                    <Stack gap={1}>
                      <Body className="text-white">Weather Alerts</Body>
                      <Body className="text-body-sm text-ink-400">Critical weather warnings for events</Body>
                    </Stack>
                    <Switch
                      checked={notifications.weatherAlerts}
                      onChange={(e) => setNotifications({ ...notifications, weatherAlerts: e.target.checked })}
                    />
                  </Stack>
                </Card>
              </Stack>
            </Stack>
          </Card>

          <Card className="p-spacing-6 border-2 border-ink-800 bg-transparent">
            <Stack gap={6}>
              <H2>Radio Configuration</H2>
              <Grid cols={2} gap={6}>
                <Stack gap={2}>
                  <Body>Default Channel</Body>
                  <Select>
                    <option value="1">Channel 1 - Main</option>
                    <option value="2">Channel 2 - Crew</option>
                    <option value="3">Channel 3 - Tech</option>
                  </Select>
                </Stack>
                <Stack gap={2}>
                  <Body>Privacy Code</Body>
                  <Select>
                    <option value="0">None</option>
                    <option value="1">Code 1</option>
                    <option value="2">Code 2</option>
                  </Select>
                </Stack>
              </Grid>
            </Stack>
          </Card>

          <Card className="p-spacing-6 border-2 border-ink-800 bg-transparent">
            <Stack gap={6}>
              <H2>Safety Settings</H2>
              <Stack gap={4}>
                <Button variant="outlineInk" fullWidth className="justify-start text-left" onClick={() => router.push('/settings/emergency-contacts')}>
                  <Stack gap={1}>
                    <Body className="font-heading uppercase tracking-widest">Emergency Contacts</Body>
                    <Body className="text-body-sm text-ink-400">Manage emergency contact list</Body>
                  </Stack>
                </Button>
                <Button variant="outlineInk" fullWidth className="justify-start text-left" onClick={() => router.push('/settings/incident-reporting')}>
                  <Stack gap={1}>
                    <Body className="font-heading uppercase tracking-widest">Incident Reporting</Body>
                    <Body className="text-body-sm text-ink-400">Configure incident notification settings</Body>
                  </Stack>
                </Button>
              </Stack>
            </Stack>
          </Card>

            <Stack gap={3} direction="horizontal">
              <Button variant="outlineWhite" onClick={() => addNotification({ type: 'success', title: 'Saved', message: 'Settings saved successfully' })}>Save Settings</Button>
              <Button variant="ghost" onClick={() => router.push('/dashboard')}>Reset to Defaults</Button>
            </Stack>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
