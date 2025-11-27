"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PageLayout,
  Navigation,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  H2,
  H3,
  Body,
  Button,
  Input,
  SectionLayout,
  Alert,
  Stack,
  Label,
  Badge,
  Card,
  StatCard,
  Grid,
  Container,
  signOut,
  Link,
} from "@ghxstship/ui";

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
      header={
        <Navigation
          logo={
            <Display size="md" className="text-display-md">
              GVTEWAY
            </Display>
          }
          cta={
            <Button variant="outlineWhite" size="sm" onClick={handleSignOut}>
              SIGN OUT
            </Button>
          }
        >
          <Link href="/" className="font-heading text-body-sm uppercase tracking-widest hover:text-ink-400">
            Home
          </Link>
          <Link href="/events" className="font-heading text-body-sm uppercase tracking-widest hover:text-ink-400">
            Events
          </Link>
          <Link href="/profile" className="font-heading text-body-sm uppercase tracking-widest text-white">
            Profile
          </Link>
        </Navigation>
      }
      footer={
        <Footer
          logo={
            <Display size="md" className="text-white text-display-md">
              GVTEWAY
            </Display>
          }
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Account">
            <FooterLink href="/profile">Profile</FooterLink>
            <FooterLink href="/orders">Orders</FooterLink>
            <FooterLink href="/tickets">Tickets</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="#">Privacy</FooterLink>
            <FooterLink href="#">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <SectionLayout background="black">
        <Container size="lg">
          <Stack gap={8}>
            <Stack gap={4} direction="horizontal" className="justify-between items-center">
              <Stack gap={2}>
                <H2 className="text-white">My Profile</H2>
                <Body className="text-ink-400">Manage your account information and preferences</Body>
              </Stack>
              {!isEditing && (
                <Button variant="outlineWhite" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </Stack>

            {saved && <Alert variant="success">Profile updated successfully</Alert>}

            <Grid cols={3} gap={8}>
              <Card className="border-2 border-ink-800 p-6 bg-transparent col-span-2">
                <H3 className="mb-6 text-white">Personal Information</H3>
                <Stack gap={6}>
                  <Grid cols={2} gap={4}>
                    <Stack gap={2}>
                      <Label className="font-heading text-body-sm uppercase tracking-widest text-ink-400">
                        First Name
                      </Label>
                      {isEditing ? (
                        <Input
                          value={profile.firstName}
                          onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                          className="border-ink-700 bg-black text-white"
                        />
                      ) : (
                        <Body className="font-mono text-white">{profile.firstName}</Body>
                      )}
                    </Stack>
                    <Stack gap={2}>
                      <Label className="font-heading text-body-sm uppercase tracking-widest text-ink-400">
                        Last Name
                      </Label>
                      {isEditing ? (
                        <Input
                          value={profile.lastName}
                          onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                          className="border-ink-700 bg-black text-white"
                        />
                      ) : (
                        <Body className="font-mono text-white">{profile.lastName}</Body>
                      )}
                    </Stack>
                  </Grid>

                  <Stack gap={2}>
                    <Label className="font-heading text-body-sm uppercase tracking-widest text-ink-400">
                      Email
                    </Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="border-ink-700 bg-black text-white"
                      />
                    ) : (
                      <Body className="font-mono text-white">{profile.email}</Body>
                    )}
                  </Stack>

                  <Stack gap={2}>
                    <Label className="font-heading text-body-sm uppercase tracking-widest text-ink-400">
                      Phone
                    </Label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="border-ink-700 bg-black text-white"
                      />
                    ) : (
                      <Body className="font-mono text-white">{profile.phone}</Body>
                    )}
                  </Stack>

                  <Grid cols={2} gap={4}>
                    <Stack gap={2}>
                      <Label className="font-heading text-body-sm uppercase tracking-widest text-ink-400">
                        City
                      </Label>
                      {isEditing ? (
                        <Input
                          value={profile.city}
                          onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                          className="border-ink-700 bg-black text-white"
                        />
                      ) : (
                        <Body className="font-mono text-white">{profile.city}</Body>
                      )}
                    </Stack>
                    <Stack gap={2}>
                      <Label className="font-heading text-body-sm uppercase tracking-widest text-ink-400">
                        State
                      </Label>
                      {isEditing ? (
                        <Input
                          value={profile.state}
                          onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                          className="border-ink-700 bg-black text-white"
                        />
                      ) : (
                        <Body className="font-mono text-white">{profile.state}</Body>
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

            <Stack gap={6}>
              <Card className="border-2 border-ink-800 p-6 bg-transparent">
                <H3 className="mb-4 text-white">Roles & Access</H3>
                <Stack gap={3}>
                  <Stack gap={2}>
                    <Label size="xs" className="text-ink-500">Platform Roles</Label>
                    <Stack direction="horizontal" gap={2} className="flex-wrap">
                      {userRoles.length > 0 ? (
                        userRoles.map(role => (
                          <Badge key={role} variant="outline">{role}</Badge>
                        ))
                      ) : (
                        <Label size="xs" className="text-ink-500">{profile.role}</Label>
                      )}
                    </Stack>
                  </Stack>
                  <Stack gap={1}>
                    <Label size="xs" className="text-ink-500">Membership</Label>
                    <Display size="md" className="text-white text-h5-md">{profile.membershipTier}</Display>
                  </Stack>
                </Stack>
              </Card>

              <Card className="border-2 border-ink-800 p-6 bg-transparent">
                <H3 className="mb-4 text-white">Quick Stats</H3>
                <Stack gap={4}>
                  <StatCard label="Events Attended" value={23} className="bg-transparent border-0 p-0" />
                  <StatCard label="Active Tickets" value={4} className="bg-transparent border-0 p-0" />
                  <Stack gap={1}>
                    <Label size="xs" className="text-ink-500">Member Since</Label>
                    <Label className="text-white">Jan 2024</Label>
                  </Stack>
                </Stack>
              </Card>

              <Card className="border-2 border-ink-800 p-6 bg-transparent">
                <H3 className="mb-4 text-white">Preferences</H3>
                <Stack gap={3}>
                  <Button variant="outlineInk" fullWidth className="justify-start text-left" onClick={() => router.push('/settings/notifications')}>
                    Notifications
                  </Button>
                  <Button variant="outlineInk" fullWidth className="justify-start text-left" onClick={() => router.push('/settings/privacy')}>
                    Privacy
                  </Button>
                  <Button variant="outlineInk" fullWidth className="justify-start text-left" onClick={() => router.push('/settings/payment-methods')}>
                    Payment Methods
                  </Button>
                </Stack>
              </Card>
            </Stack>
            </Grid>
          </Stack>
        </Container>
      </SectionLayout>
    </PageLayout>
  );
}
