'use client';

import { useState, useEffect } from 'react';
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
  Alert,
} from '@ghxstship/ui';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Bell,
  Shield,
  Save,
  CheckCircle,
} from 'lucide-react';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '../../../components/app-layout';
import { useProfileData } from '@/hooks/useProfile';

export default function AccountProfilePage() {
  const { profile: userProfile, isLoading, error, saveProfile, isSaving } = useProfileData();
  const [localProfile, setLocalProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync local state with fetched profile data
  useEffect(() => {
    if (userProfile) {
      setLocalProfile({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    try {
      await saveProfile({
        ...userProfile,
        firstName: localProfile.firstName,
        lastName: localProfile.lastName,
        email: localProfile.email,
        phone: localProfile.phone,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      // Error is handled by the mutation
    }
  };

  if (isLoading) {
    return <GvtewayLoadingLayout text="Loading profile..." />;
  }

  return (
    <GvtewayAppLayout>
      <Stack gap={8}>
        <SectionHeader kicker="My Account" title="Profile Settings" description="Manage your account information and preferences" colorScheme="on-dark" />

        {error && (
          <Alert variant="error">
            <Body>Failed to load profile. Please try again.</Body>
          </Alert>
        )}

        {saveSuccess && (
          <Alert variant="success">
            <Stack direction="horizontal" gap={2} className="items-center">
              <CheckCircle size={16} />
              <Body>Profile saved successfully!</Body>
            </Stack>
          </Alert>
        )}

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
                    <Input value={localProfile.firstName} onChange={(e) => setLocalProfile(p => ({ ...p, firstName: e.target.value }))} />
                  </Stack>
                  <Stack gap={2}>
                    <Label>Last Name</Label>
                    <Input value={localProfile.lastName} onChange={(e) => setLocalProfile(p => ({ ...p, lastName: e.target.value }))} />
                  </Stack>
                </Grid>
                <Stack gap={2}>
                  <Label>Email</Label>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Mail size={16} className="text-on-dark-muted" />
                    <Input value={localProfile.email} onChange={(e) => setLocalProfile(p => ({ ...p, email: e.target.value }))} className="flex-1" />
                  </Stack>
                </Stack>
                <Stack gap={2}>
                  <Label>Phone</Label>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Phone size={16} className="text-on-dark-muted" />
                    <Input value={localProfile.phone} onChange={(e) => setLocalProfile(p => ({ ...p, phone: e.target.value }))} className="flex-1" />
                  </Stack>
                </Stack>
                <Button variant="solid" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : <><Save size={16} className="mr-2" />Save Changes</>}
                </Button>
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
