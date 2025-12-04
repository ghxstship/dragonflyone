"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CompvssAppLayout } from "@/components/app-layout";
import {
  H2,
  H3,
  Body,
  Button,
  Input,
  Alert,
  Stack,
  Label,
  Badge,
  Card,
  StatCard,
  Grid,
  Kicker,
  signOut,
} from "@ghxstship/ui";
import { User, Bell, Shield, Briefcase, LogOut, Edit3 } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "Crew",
    lastName: "Lead",
    email: "crew@ghxstship.com",
    phone: "(555) 987-6543",
    department: "Stage Management",
    title: "Stage Manager",
    role: "COMPVSS_CREW",
  });
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setProfile({ ...profile, ...data.user });
          setUserRoles(data.user.platformRoles || []);
        }
      })
      .catch(err => console.error('Failed to load profile:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <CompvssAppLayout variant="authenticated">
      <Stack gap={10}>
        {/* Page Header */}
        <Stack gap={4} direction="horizontal" className="flex-col items-start justify-between md:flex-row md:items-center">
          <Stack gap={2}>
            <Kicker>Account Settings</Kicker>
            <H2 size="lg">My Profile</H2>
            <Body className="text-muted">Manage your account information and preferences</Body>
          </Stack>
          <Stack direction="horizontal" gap={3}>
            {!isEditing && (
              <Button 
                variant="solid" 
                onClick={() => setIsEditing(true)}
                icon={<Edit3 className="size-4" />}
                iconPosition="left"
              >
                Edit Profile
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              icon={<LogOut className="size-4" />}
              iconPosition="left"
            >
              Sign Out
            </Button>
          </Stack>
        </Stack>

        {saved && <Alert variant="success">Profile updated successfully</Alert>}

        <Grid cols={3} gap={6}>
          {/* Personal Information Card */}
          <Card className="col-span-2 p-6">
            <Stack gap={2} className="mb-6">
              <Stack direction="horizontal" gap={2} className="items-center">
                <User className="size-5 text-muted" />
                <H3>Personal Information</H3>
              </Stack>
            </Stack>
            <Stack gap={6}>
              <Grid cols={2} gap={4}>
                <Stack gap={2}>
                  <Label size="xs" className="text-muted">First Name</Label>
                  {isEditing ? (
                    <Input
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    />
                  ) : (
                    <Body className="font-mono">{profile.firstName}</Body>
                  )}
                </Stack>
                <Stack gap={2}>
                  <Label size="xs" className="text-muted">Last Name</Label>
                  {isEditing ? (
                    <Input
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    />
                  ) : (
                    <Body className="font-mono">{profile.lastName}</Body>
                  )}
                </Stack>
              </Grid>

              <Stack gap={2}>
                <Label size="xs" className="text-muted">Email</Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                ) : (
                  <Body className="font-mono">{profile.email}</Body>
                )}
              </Stack>

              <Stack gap={2}>
                <Label size="xs" className="text-muted">Phone</Label>
                {isEditing ? (
                  <Input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                ) : (
                  <Body className="font-mono">{profile.phone}</Body>
                )}
              </Stack>

              <Grid cols={2} gap={4}>
                <Stack gap={2}>
                  <Label size="xs" className="text-muted">Department</Label>
                  {isEditing ? (
                    <Input
                      value={profile.department}
                      onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    />
                  ) : (
                    <Body className="font-mono">{profile.department}</Body>
                  )}
                </Stack>
                <Stack gap={2}>
                  <Label size="xs" className="text-muted">Title</Label>
                  {isEditing ? (
                    <Input
                      value={profile.title}
                      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    />
                  ) : (
                    <Body className="font-mono">{profile.title}</Body>
                  )}
                </Stack>
              </Grid>

              {isEditing && (
                <Stack gap={3} direction="horizontal">
                  <Button variant="solid" onClick={handleSave}>
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </Stack>
              )}
            </Stack>
          </Card>

          {/* Sidebar Cards */}
          <Stack gap={6}>
            <Card className="p-6">
              <Stack gap={2} className="mb-4">
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Shield className="size-5 text-muted" />
                  <H3>Roles & Access</H3>
                </Stack>
              </Stack>
              <Stack gap={4}>
                <Stack gap={2}>
                  <Label size="xs" className="text-muted">Platform Roles</Label>
                  <Stack direction="horizontal" gap={2} className="flex-wrap">
                    {userRoles.length > 0 ? (
                      userRoles.map(role => (
                        <Badge key={role} variant="outline">{role}</Badge>
                      ))
                    ) : (
                      <Badge variant="outline">{profile.role}</Badge>
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </Card>

            <Card className="p-6">
              <H3 className="mb-4">Quick Stats</H3>
              <Stack gap={4}>
                <StatCard label="Active Productions" value="3" />
                <StatCard label="Completed Shows" value="47" />
                <Stack gap={1}>
                  <Label size="xs" className="text-muted">Member Since</Label>
                  <Body>Jan 2024</Body>
                </Stack>
              </Stack>
            </Card>

            <Card className="p-6">
              <H3 className="mb-4">Preferences</H3>
              <Stack gap={3}>
                <Button 
                  variant="outline" 
                  fullWidth 
                  onClick={() => router.push('/settings/notifications')}
                  icon={<Bell className="size-4" />}
                  iconPosition="left"
                >
                  Notifications
                </Button>
                <Button 
                  variant="outline" 
                  fullWidth 
                  onClick={() => router.push('/settings/privacy')}
                  icon={<Shield className="size-4" />}
                  iconPosition="left"
                >
                  Privacy
                </Button>
                <Button 
                  variant="outline" 
                  fullWidth 
                  onClick={() => router.push('/credentials')}
                  icon={<Briefcase className="size-4" />}
                  iconPosition="left"
                >
                  Credentials
                </Button>
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Stack>
    </CompvssAppLayout>
  );
}
