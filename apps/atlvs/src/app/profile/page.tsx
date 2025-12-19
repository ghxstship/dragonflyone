"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AtlvsAppLayout } from "@/components/app-layout";
import {
  H3,
  Body,
  Button,
  Input,
  PhoneInput,
  Alert,
  Stack,
  Label,
  Badge,
  Card,
  StatCard,
  Grid,
  EnterprisePageHeader,
  MainContent,
  Container,
  signOut,
} from "@ghxstship/ui";
import { User, Bell, Shield, Building2, LogOut, Edit3 } from "lucide-react";
import { useProfileData } from "@/hooks/useProfile";

export default function ProfilePage() {
  const router = useRouter();
  const {
    profile: initialProfile,
    userRoles,
    updateProfile,
  } = useProfileData();

  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState(initialProfile);

  // Sync profile state when data loads
  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const handleSave = async () => {
    try {
      await updateProfile(profile);
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // Error handled in hook
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <AtlvsAppLayout variant="authenticated">
      <EnterprisePageHeader
        title="My Profile"
        subtitle="Manage your account information and preferences"
        primaryAction={!isEditing ? {
          label: "Edit Profile",
          onClick: () => setIsEditing(true),
          icon: <Edit3 className="size-4" />,
        } : undefined}
        secondaryActions={[
          {
            id: "sign-out",
            label: "Sign Out",
            onClick: handleSignOut,
            icon: <LogOut className="size-4" />,
          },
        ]}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>
            {saved && <Alert variant="success">Profile updated successfully</Alert>}

            <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
          {/* Personal Information Card */}
          <Card inverted className="col-span-2 p-6">
            <Stack gap={2} className="mb-6">
              <Stack direction="horizontal" gap={2} className="items-center">
                <User className="size-5 text-on-dark-muted" />
                <H3 className="text-white">Personal Information</H3>
              </Stack>
            </Stack>
            <Stack gap={6}>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={2}>
                  <Label size="xs" className="text-on-dark-muted">First Name</Label>
                  {isEditing ? (
                    <Input
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      inverted
                    />
                  ) : (
                    <Body className="font-mono text-white">{profile.firstName}</Body>
                  )}
                </Stack>
                <Stack gap={2}>
                  <Label size="xs" className="text-on-dark-muted">Last Name</Label>
                  {isEditing ? (
                    <Input
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      inverted
                    />
                  ) : (
                    <Body className="font-mono text-white">{profile.lastName}</Body>
                  )}
                </Stack>
              </Grid>

              <Stack gap={2}>
                <Label size="xs" className="text-on-dark-muted">Email</Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    inverted
                  />
                ) : (
                  <Body className="font-mono text-white">{profile.email}</Body>
                )}
              </Stack>

              <Stack gap={2}>
                <Label size="xs" className="text-on-dark-muted">Phone</Label>
                {isEditing ? (
                  <PhoneInput
                    value={profile.phone}
                    onChange={(value) => setProfile({ ...profile, phone: value })}
                    inverted
                    fullWidth
                  />
                ) : (
                  <Body className="font-mono text-white">{profile.phone}</Body>
                )}
              </Stack>

              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={2}>
                  <Label size="xs" className="text-on-dark-muted">Department</Label>
                  {isEditing ? (
                    <Input
                      value={profile.department}
                      onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                      inverted
                    />
                  ) : (
                    <Body className="font-mono text-white">{profile.department}</Body>
                  )}
                </Stack>
                <Stack gap={2}>
                  <Label size="xs" className="text-on-dark-muted">Title</Label>
                  {isEditing ? (
                    <Input
                      value={profile.title}
                      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                      inverted
                    />
                  ) : (
                    <Body className="font-mono text-white">{profile.title}</Body>
                  )}
                </Stack>
              </Grid>

              {isEditing && (
                <Stack gap={3} direction="horizontal">
                  <Button variant="solid" inverted onClick={handleSave}>
                    Save Changes
                  </Button>
                  <Button variant="outlineInk" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </Stack>
              )}
            </Stack>
          </Card>

          {/* Sidebar Cards */}
          <Stack gap={6}>
            <Card inverted className="p-6">
              <Stack gap={2} className="mb-4">
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Shield className="size-5 text-on-dark-muted" />
                  <H3 className="text-white">Roles & Access</H3>
                </Stack>
              </Stack>
              <Stack gap={4}>
                <Stack gap={2}>
                  <Label size="xs" className="text-on-dark-disabled">Platform Roles</Label>
                  <Stack direction="horizontal" gap={2} className="flex-wrap">
                    {userRoles.length > 0 ? (
                      userRoles.map((role: string) => (
                        <Badge key={role} variant="outline">{role}</Badge>
                      ))
                    ) : (
                      <Badge variant="outline">{profile.role}</Badge>
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </Card>

            <Card inverted className="p-6">
              <H3 className="mb-4 text-white">Quick Stats</H3>
              <Stack gap={4}>
                <StatCard label="Active Projects" value="8" inverted />
                <StatCard label="Team Members" value="24" inverted />
                <Stack gap={1}>
                  <Label size="xs" className="text-on-dark-disabled">Member Since</Label>
                  <Body className="text-white">Jan 2024</Body>
                </Stack>
              </Stack>
            </Card>

            <Card inverted className="p-6">
              <H3 className="mb-4 text-white">Preferences</H3>
              <Stack gap={3}>
                <Button 
                  variant="outlineInk" 
                  fullWidth 
                  onClick={() => router.push('/settings/notifications')}
                  icon={<Bell className="size-4" />}
                  iconPosition="left"
                >
                  Notifications
                </Button>
                <Button 
                  variant="outlineInk" 
                  fullWidth 
                  onClick={() => router.push('/settings/privacy')}
                  icon={<Shield className="size-4" />}
                  iconPosition="left"
                >
                  Privacy
                </Button>
                <Button 
                  variant="outlineInk" 
                  fullWidth 
                  onClick={() => router.push('/settings')}
                  icon={<Building2 className="size-4" />}
                  iconPosition="left"
                >
                  Organization Settings
                </Button>
              </Stack>
            </Card>
          </Stack>
            </Grid>
          </Stack>
        </Container>
      </MainContent>
    </AtlvsAppLayout>
  );
}
