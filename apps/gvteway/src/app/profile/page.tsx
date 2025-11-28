"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConsumerNavigationAuthenticated } from "@/components/navigation";
import {
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  H2,
  H3,
  Body,
  Button,
  Input,
  Section,
  Alert,
  Stack,
  Label,
  Badge,
  Card,
  StatCard,
  Grid,
  Container,
  Kicker,
  signOut,
} from "@ghxstship/ui";
import { User, Bell, Shield, CreditCard, LogOut, Edit3 } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "Alex",
    lastName: "Johnson",
    email: "alex.johnson@example.com",
    phone: "(305) 555-0123",
    city: "Miami",
    state: "FL",
    role: "GVTEWAY_MEMBER",
    membershipTier: "PLUS",
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
    <PageLayout
      background="black"
      header={<ConsumerNavigationAuthenticated />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Account">
            <FooterLink href="/profile">Profile</FooterLink>
            <FooterLink href="/orders">Orders</FooterLink>
            <FooterLink href="/tickets">Tickets</FooterLink>
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
            <Stack gap={4} direction="horizontal" className="flex-col items-start justify-between md:flex-row md:items-center">
              <Stack gap={2}>
                <Kicker colorScheme="on-dark">Account Settings</Kicker>
                <H2 size="lg" className="text-white">My Profile</H2>
                <Body className="text-on-dark-muted">Manage your account information and preferences</Body>
              </Stack>
              <Stack direction="horizontal" gap={3}>
                {!isEditing && (
                  <Button 
                    variant="solid" 
                    inverted 
                    onClick={() => setIsEditing(true)}
                    icon={<Edit3 className="size-4" />}
                    iconPosition="left"
                  >
                    Edit Profile
                  </Button>
                )}
                <Button 
                  variant="outlineInk" 
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
              <Card inverted className="col-span-2 p-6">
                <Stack gap={2} className="mb-6">
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <User className="size-5 text-on-dark-muted" />
                    <H3 className="text-white">Personal Information</H3>
                  </Stack>
                </Stack>
                <Stack gap={6}>
                  <Grid cols={2} gap={4}>
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
                      <Input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        inverted
                      />
                    ) : (
                      <Body className="font-mono text-white">{profile.phone}</Body>
                    )}
                  </Stack>

                  <Grid cols={2} gap={4}>
                    <Stack gap={2}>
                      <Label size="xs" className="text-on-dark-muted">City</Label>
                      {isEditing ? (
                        <Input
                          value={profile.city}
                          onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                          inverted
                        />
                      ) : (
                        <Body className="font-mono text-white">{profile.city}</Body>
                      )}
                    </Stack>
                    <Stack gap={2}>
                      <Label size="xs" className="text-on-dark-muted">State</Label>
                      {isEditing ? (
                        <Input
                          value={profile.state}
                          onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                          inverted
                        />
                      ) : (
                        <Body className="font-mono text-white">{profile.state}</Body>
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
                          userRoles.map(role => (
                            <Badge key={role} variant="outline">{role}</Badge>
                          ))
                        ) : (
                          <Badge variant="outline">{profile.role}</Badge>
                        )}
                      </Stack>
                    </Stack>
                    <Stack gap={1}>
                      <Label size="xs" className="text-on-dark-disabled">Membership</Label>
                      <Body className="font-display text-white">{profile.membershipTier}</Body>
                    </Stack>
                  </Stack>
                </Card>

                <Card inverted className="p-6">
                  <H3 className="mb-4 text-white">Quick Stats</H3>
                  <Stack gap={4}>
                    <StatCard label="Events Attended" value="23" inverted />
                    <StatCard label="Active Tickets" value="4" inverted />
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
                      onClick={() => router.push('/settings/payment-methods')}
                      icon={<CreditCard className="size-4" />}
                      iconPosition="left"
                    >
                      Payment Methods
                    </Button>
                  </Stack>
                </Card>
              </Stack>
            </Grid>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
