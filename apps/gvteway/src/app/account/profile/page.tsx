'use client';

import { useState } from 'react';
import {
  SectionHeader,
  Card,
  CardBody,
  Stack,
  Button,
  Grid,
  Body,
  H3,
  Input,
  Label,
} from '@ghxstship/ui';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Bell,
  Shield,
  Save,
} from 'lucide-react';
import { GvtewayAppLayout } from '../../../components/app-layout';

export default function AccountProfilePage() {
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
  });

  const handleSave = () => {
    // Save profile
  };

  return (
    <GvtewayAppLayout>
      <Stack gap={8}>
        <SectionHeader kicker="My Account" title="Profile Settings" description="Manage your account information and preferences" colorScheme="on-dark" />

        <Grid cols={2} gap={6}>
          <Card variant="elevated" inverted>
            <CardBody>
              <Stack gap={4}>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <User size={20} />
                  <H3 className="text-white">Personal Information</H3>
                </Stack>
                <Grid cols={2} gap={4}>
                  <Stack gap={2}>
                    <Label>First Name</Label>
                    <Input value={profile.firstName} onChange={(e) => setProfile(p => ({ ...p, firstName: e.target.value }))} />
                  </Stack>
                  <Stack gap={2}>
                    <Label>Last Name</Label>
                    <Input value={profile.lastName} onChange={(e) => setProfile(p => ({ ...p, lastName: e.target.value }))} />
                  </Stack>
                </Grid>
                <Stack gap={2}>
                  <Label>Email</Label>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Mail size={16} className="text-on-dark-muted" />
                    <Input value={profile.email} onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))} className="flex-1" />
                  </Stack>
                </Stack>
                <Stack gap={2}>
                  <Label>Phone</Label>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Phone size={16} className="text-on-dark-muted" />
                    <Input value={profile.phone} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))} className="flex-1" />
                  </Stack>
                </Stack>
                <Button variant="solid" onClick={handleSave}><Save size={16} className="mr-2" />Save Changes</Button>
              </Stack>
            </CardBody>
          </Card>

          <Stack gap={6}>
            <Card variant="elevated" inverted>
              <CardBody>
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <CreditCard size={20} />
                    <H3 className="text-white">Payment Methods</H3>
                  </Stack>
                  <Stack gap={3}>
                    <Stack direction="horizontal" className="items-center justify-between rounded border-2 border-ink-700 p-3">
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <CreditCard size={20} />
                        <Stack gap={0}>
                          <Body className="text-white">Visa ending in 4242</Body>
                          <Body size="sm" className="text-on-dark-muted">Expires 12/25</Body>
                        </Stack>
                      </Stack>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </Stack>
                  </Stack>
                  <Button variant="outline">Add Payment Method</Button>
                </Stack>
              </CardBody>
            </Card>

            <Card variant="elevated" inverted>
              <CardBody>
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Bell size={20} />
                    <H3 className="text-white">Notifications</H3>
                  </Stack>
                  <Stack gap={3}>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Body className="text-white">Email notifications</Body>
                      <Button variant="outline" size="sm">Enabled</Button>
                    </Stack>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Body className="text-white">SMS notifications</Body>
                      <Button variant="outline" size="sm">Disabled</Button>
                    </Stack>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Body className="text-white">Event reminders</Body>
                      <Button variant="outline" size="sm">Enabled</Button>
                    </Stack>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>

            <Card variant="elevated" inverted>
              <CardBody>
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Shield size={20} />
                    <H3 className="text-white">Security</H3>
                  </Stack>
                  <Stack gap={2}>
                    <Button variant="outline">Change Password</Button>
                    <Button variant="outline">Two-Factor Authentication</Button>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          </Stack>
        </Grid>
      </Stack>
    </GvtewayAppLayout>
  );
}
