"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@ghxstship/ui";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  H1,
  H2,
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
} from "@ghxstship/ui";

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
    <Section className="min-h-screen bg-black text-white">
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <H1>Production Settings</H1>

          <Card className="p-6 border-2 border-grey-800 bg-transparent">
            <Stack gap={6}>
              <H2>Alert Preferences</H2>
              <Stack gap={4}>
                <Card className="p-4 border border-grey-800 bg-transparent">
                  <Stack gap={4} direction="horizontal" className="justify-between items-center">
                    <Stack gap={1}>
                      <Body className="text-white">Crew Alerts</Body>
                      <Body className="text-sm text-grey-400">Get notified about crew availability changes</Body>
                    </Stack>
                    <Switch
                      checked={notifications.crewAlerts}
                      onChange={(e) => setNotifications({ ...notifications, crewAlerts: e.target.checked })}
                    />
                  </Stack>
                </Card>
                <Card className="p-4 border border-grey-800 bg-transparent">
                  <Stack gap={4} direction="horizontal" className="justify-between items-center">
                    <Stack gap={1}>
                      <Body className="text-white">Equipment Alerts</Body>
                      <Body className="text-sm text-grey-400">Maintenance and availability notifications</Body>
                    </Stack>
                    <Switch
                      checked={notifications.equipmentAlerts}
                      onChange={(e) => setNotifications({ ...notifications, equipmentAlerts: e.target.checked })}
                    />
                  </Stack>
                </Card>
                <Card className="p-4 border border-grey-800 bg-transparent">
                  <Stack gap={4} direction="horizontal" className="justify-between items-center">
                    <Stack gap={1}>
                      <Body className="text-white">Schedule Changes</Body>
                      <Body className="text-sm text-grey-400">Project timeline and schedule updates</Body>
                    </Stack>
                    <Switch
                      checked={notifications.scheduleChanges}
                      onChange={(e) => setNotifications({ ...notifications, scheduleChanges: e.target.checked })}
                    />
                  </Stack>
                </Card>
                <Card className="p-4 border border-grey-800 bg-transparent">
                  <Stack gap={4} direction="horizontal" className="justify-between items-center">
                    <Stack gap={1}>
                      <Body className="text-white">Weather Alerts</Body>
                      <Body className="text-sm text-grey-400">Critical weather warnings for events</Body>
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

          <Card className="p-6 border-2 border-grey-800 bg-transparent">
            <Stack gap={6}>
              <H2>Radio Configuration</H2>
              <Grid cols={2} gap={6}>
                <Stack gap={2}>
                  <Label>Default Channel</Label>
                  <Select className="bg-black text-white border-grey-700">
                    <option value="1">Channel 1 - Main</option>
                    <option value="2">Channel 2 - Crew</option>
                    <option value="3">Channel 3 - Tech</option>
                  </Select>
                </Stack>
                <Stack gap={2}>
                  <Label>Privacy Code</Label>
                  <Select className="bg-black text-white border-grey-700">
                    <option value="0">None</option>
                    <option value="1">Code 1</option>
                    <option value="2">Code 2</option>
                  </Select>
                </Stack>
              </Grid>
            </Stack>
          </Card>

          <Card className="p-6 border-2 border-grey-800 bg-transparent">
            <Stack gap={6}>
              <H2>Safety Settings</H2>
              <Stack gap={4}>
                <Button variant="outline" className="w-full justify-start text-left border-grey-700 hover:border-white" onClick={() => router.push('/settings/emergency-contacts')}>
                  <Stack gap={1}>
                    <Body className="font-heading uppercase tracking-wider">Emergency Contacts</Body>
                    <Body className="text-sm text-grey-400">Manage emergency contact list</Body>
                  </Stack>
                </Button>
                <Button variant="outline" className="w-full justify-start text-left border-grey-700 hover:border-white" onClick={() => router.push('/settings/incident-reporting')}>
                  <Stack gap={1}>
                    <Body className="font-heading uppercase tracking-wider">Incident Reporting</Body>
                    <Body className="text-sm text-grey-400">Configure incident notification settings</Body>
                  </Stack>
                </Button>
              </Stack>
            </Stack>
          </Card>

          <Stack gap={3} direction="horizontal">
            <Button variant="outlineWhite" onClick={() => addNotification({ type: 'success', title: 'Saved', message: 'Settings saved successfully' })}>Save Settings</Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push('/dashboard')}>Reset to Defaults</Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
