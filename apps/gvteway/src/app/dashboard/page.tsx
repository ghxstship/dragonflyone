'use client';

import { useEffect } from 'react';
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
  StatCard,
  Grid,
  Stack,
  Badge,
  Label,
  Kicker,
  LoadingSpinner,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
} from '@ghxstship/ui';
import { useAuth } from '@ghxstship/config/auth-context';
import { PlatformRole } from '@ghxstship/config/roles';
import { useEvents } from '@/hooks/useEvents';
import { useOrders } from '@/hooks/useOrders';
import { LogOut, Calendar, Ticket, User, Settings, Music, Building2, BarChart3 } from 'lucide-react';

/**
 * Role-based Dashboard Router
 * Displays different dashboard views based on user's primary role
 * Bold Contemporary Pop Art Adventure aesthetic
 */
export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const { data: events } = useEvents();
  const { data: orders } = useOrders();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !user) {
    return (
      <PageLayout
        background="black"
        header={<ConsumerNavigationPublic />}
        footer={
          <Footer
            logo={<Display size="md">GVTEWAY</Display>}
            copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
          >
            <FooterColumn title="Discover">
              <FooterLink href="/events">Browse Events</FooterLink>
              <FooterLink href="/venues">Find Venues</FooterLink>
              <FooterLink href="/artists">Artists</FooterLink>
            </FooterColumn>
            <FooterColumn title="Support">
              <FooterLink href="/help">Help Center</FooterLink>
              <FooterLink href="/help#contact">Contact</FooterLink>
            </FooterColumn>
            <FooterColumn title="Legal">
              <FooterLink href="/legal/privacy">Privacy</FooterLink>
              <FooterLink href="/legal/terms">Terms</FooterLink>
            </FooterColumn>
          </Footer>
        }
      >
        <Section background="black" className="relative min-h-screen overflow-hidden py-16">
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
          <Container className="relative z-10 flex min-h-[60vh] items-center justify-center">
            <LoadingSpinner size="lg" text="Loading dashboard..." />
          </Container>
        </Section>
      </PageLayout>
    );
  }

  // Determine which dashboard to show based on highest role
  const hasLegendRole = user.platformRoles.some(r => r.startsWith('LEGEND_'));
  const isAdmin = user.platformRoles.some(r => r.includes('ADMIN'));
  const isExperienceCreator = user.platformRoles.includes(
    PlatformRole.GVTEWAY_EXPERIENCE_CREATOR
  );
  const isVenueManager = user.platformRoles.includes(
    PlatformRole.GVTEWAY_VENUE_MANAGER
  );
  const isArtist = user.platformRoles.some(r =>
    r.includes('ARTIST')
  );

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Discover">
            <FooterLink href="/events">Browse Events</FooterLink>
            <FooterLink href="/venues">Find Venues</FooterLink>
            <FooterLink href="/artists">Artists</FooterLink>
          </FooterColumn>
          <FooterColumn title="Support">
            <FooterLink href="/help">Help Center</FooterLink>
            <FooterLink href="/help#contact">Contact</FooterLink>
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
            {/* Header */}
            <Card inverted variant="elevated" className="p-6">
              <Stack gap={4} direction="horizontal" className="flex-col items-start justify-between md:flex-row md:items-center">
                <Stack gap={2}>
                  <Kicker colorScheme="on-dark">Welcome Back</Kicker>
                  <H2 size="lg" className="text-white">{user.name}</H2>
                  <Body className="text-on-dark-muted">{user.email}</Body>
                  <Stack gap={2} direction="horizontal" className="mt-2 flex-wrap">
                    {user.platformRoles.map(role => (
                      <Badge key={role} variant="solid">
                        {role}
                      </Badge>
                    ))}
                  </Stack>
                </Stack>
                <Button 
                  variant="outlineInk" 
                  onClick={logout}
                  icon={<LogOut className="size-4" />}
                  iconPosition="left"
                >
                  Sign Out
                </Button>
              </Stack>
            </Card>

            {/* Legend/Admin Dashboard */}
            {(hasLegendRole || isAdmin) && (
              <Stack gap={8}>
                <Stack gap={2}>
                  <Kicker colorScheme="on-dark">Administration</Kicker>
                  <H2 className="text-white">Admin Overview</H2>
                </Stack>
                <Grid cols={4} gap={4}>
                  <StatCard
                    value="1,247"
                    label="Total Users"
                    trend="up"
                    trendValue="+12%"
                    inverted
                  />
                  <StatCard
                    value={events?.length?.toString() || '0'}
                    label="Active Events"
                    trend="up"
                    trendValue="+8%"
                    inverted
                  />
                  <StatCard
                    value={orders?.length?.toString() || '0'}
                    label="Total Orders"
                    trend="up"
                    trendValue="+23%"
                    inverted
                  />
                  <StatCard
                    value="99.8%"
                    label="Uptime"
                    trend="up"
                    trendValue="+0.2%"
                    inverted
                  />
                </Grid>

                <Grid cols={3} gap={6}>
                  <Card inverted className="p-6">
                    <H3 className="mb-4 text-white">Platform Access</H3>
                    <Stack gap={3}>
                      <Button variant="solid" fullWidth inverted onClick={() => router.push('/admin/atlvs')}>
                        ATLVS Admin
                      </Button>
                      <Button variant="solid" fullWidth inverted onClick={() => router.push('/admin/compvss')}>
                        COMPVSS Admin
                      </Button>
                      <Button variant="solid" fullWidth inverted onClick={() => router.push('/admin/gvteway')}>
                        GVTEWAY Admin
                      </Button>
                    </Stack>
                  </Card>

                  <Card inverted className="p-6">
                    <H3 className="mb-4 text-white">System Health</H3>
                    <Stack gap={3}>
                      <Stack gap={2} direction="horizontal" className="justify-between">
                        <Body className="text-on-dark-muted">API Response</Body>
                        <Body size="sm" className="font-display text-white">45ms</Body>
                      </Stack>
                      <Stack gap={2} direction="horizontal" className="justify-between">
                        <Body className="text-on-dark-muted">Database</Body>
                        <Body size="sm" className="font-display text-success">Healthy</Body>
                      </Stack>
                      <Stack gap={2} direction="horizontal" className="justify-between">
                        <Body className="text-on-dark-muted">Cache Hit</Body>
                        <Body size="sm" className="font-display text-white">94%</Body>
                      </Stack>
                    </Stack>
                  </Card>

                  <Card inverted className="p-6">
                    <H3 className="mb-4 text-white">Recent Activity</H3>
                    <Stack gap={2}>
                      <Body size="sm" className="text-on-dark-muted">New event created: Summer Fest</Body>
                      <Body size="sm" className="text-on-dark-muted">User registered: john@example.com</Body>
                      <Body size="sm" className="text-on-dark-muted">Order completed: #12847</Body>
                      <Body size="sm" className="text-on-dark-muted">Ticket scanned: VIP-002341</Body>
                    </Stack>
                  </Card>
                </Grid>
              </Stack>
            )}

            {/* Experience Creator Dashboard */}
            {isExperienceCreator && (
              <Stack gap={8}>
                <Stack gap={2}>
                  <Kicker colorScheme="on-dark">Creator Portal</Kicker>
                  <H2 className="text-white">Your Experiences</H2>
                </Stack>
                <Grid cols={4} gap={4}>
                  <StatCard value="12" label="Active Events" inverted />
                  <StatCard value="3,421" label="Tickets Sold" inverted />
                  <StatCard value="$45.2K" label="Revenue" inverted />
                  <StatCard value="4.8" label="Avg Rating" inverted />
                </Grid>

                <Grid cols={2} gap={6}>
                  <Card inverted className="p-6">
                    <H3 className="mb-4 text-white">Quick Actions</H3>
                    <Stack gap={3}>
                      <Button variant="solid" fullWidth inverted icon={<Calendar className="size-4" />} iconPosition="left" onClick={() => router.push('/events/new')}>
                        Create New Event
                      </Button>
                      <Button variant="outlineInk" fullWidth icon={<Settings className="size-4" />} iconPosition="left" onClick={() => router.push('/events/manage')}>
                        Manage Events
                      </Button>
                      <Button variant="outlineInk" fullWidth icon={<BarChart3 className="size-4" />} iconPosition="left" onClick={() => router.push('/analytics')}>
                        View Analytics
                      </Button>
                    </Stack>
                  </Card>

                  <Card inverted className="p-6">
                    <H3 className="mb-4 text-white">Upcoming Events</H3>
                    <Stack gap={4}>
                      <Stack gap={1} className="pl-4" style={{ borderLeft: '4px solid #6366f1' }}>
                        <Body className="font-display text-white">Summer Music Festival</Body>
                        <Label size="xs" className="text-on-dark-muted">
                          June 15, 2024 • 342 tickets sold
                        </Label>
                      </Stack>
                      <Stack gap={1} className="pl-4" style={{ borderLeft: '4px solid #404040' }}>
                        <Body className="font-display text-white">Rock Concert Series</Body>
                        <Label size="xs" className="text-on-dark-muted">
                          July 20, 2024 • 156 tickets sold
                        </Label>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              </Stack>
            )}

            {/* Venue Manager Dashboard */}
            {isVenueManager && (
              <Stack gap={8}>
                <Stack gap={2}>
                  <Kicker colorScheme="on-dark">Venue Portal</Kicker>
                  <H2 className="text-white">Venue Management</H2>
                </Stack>
                <Grid cols={4} gap={4}>
                  <StatCard value="3" label="Active Venues" inverted />
                  <StatCard value="28" label="Events This Month" inverted />
                  <StatCard value="5,234" label="Total Capacity" inverted />
                  <StatCard value="87%" label="Avg Utilization" inverted />
                </Grid>

                <Card inverted className="p-6">
                  <H3 className="mb-4 text-white">Your Venues</H3>
                  <Stack gap={4}>
                    <Card inverted interactive onClick={() => router.push('/venues/main-stage')}>
                      <Stack direction="horizontal" className="items-center justify-between">
                        <Stack gap={1}>
                          <Body className="font-display text-white">Main Stage Theater</Body>
                          <Label size="xs" className="text-on-dark-muted">Capacity: 2,000 • Next Event: 3 days</Label>
                        </Stack>
                        <Button variant="outlineInk" size="sm" icon={<Building2 className="size-4" />} iconPosition="left">
                          Manage
                        </Button>
                      </Stack>
                    </Card>
                  </Stack>
                </Card>
              </Stack>
            )}

            {/* Artist Dashboard */}
            {isArtist && (
              <Stack gap={8}>
                <Stack gap={2}>
                  <Kicker colorScheme="on-dark">Artist Portal</Kicker>
                  <H2 className="text-white">Your Music</H2>
                </Stack>
                <Grid cols={4} gap={4}>
                  <StatCard value="8" label="Upcoming Shows" inverted />
                  <StatCard value="12.4K" label="Followers" inverted />
                  <StatCard value="1,234" label="Tracks Sold" inverted />
                  <StatCard value="$8.2K" label="Earnings" inverted />
                </Grid>

                <Grid cols={2} gap={6}>
                  <Card inverted className="p-6">
                    <H3 className="mb-4 text-white">Profile & Content</H3>
                    <Stack gap={3}>
                      <Button variant="solid" fullWidth inverted icon={<User className="size-4" />} iconPosition="left" onClick={() => router.push('/artist/profile')}>
                        Edit Profile
                      </Button>
                      <Button variant="outlineInk" fullWidth icon={<Music className="size-4" />} iconPosition="left" onClick={() => router.push('/artist/music/upload')}>
                        Upload Music
                      </Button>
                      <Button variant="outlineInk" fullWidth onClick={() => router.push('/artist/merch')}>
                        Manage Merchandise
                      </Button>
                    </Stack>
                  </Card>

                  <Card inverted className="p-6">
                    <H3 className="mb-4 text-white">Fan Engagement</H3>
                    <Stack gap={3}>
                      <Stack gap={2} direction="horizontal" className="justify-between">
                        <Body className="text-on-dark-muted">New Followers (7d)</Body>
                        <Body size="sm" className="font-display text-white">+342</Body>
                      </Stack>
                      <Stack gap={2} direction="horizontal" className="justify-between">
                        <Body className="text-on-dark-muted">Avg. Engagement</Body>
                        <Body size="sm" className="font-display text-white">8.4%</Body>
                      </Stack>
                      <Stack gap={2} direction="horizontal" className="justify-between">
                        <Body className="text-on-dark-muted">Messages</Body>
                        <Body size="sm" className="font-display text-white">23 unread</Body>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              </Stack>
            )}

            {/* Default Member Dashboard */}
            {!hasLegendRole && !isAdmin && !isExperienceCreator && !isVenueManager && !isArtist && (
              <Stack gap={8}>
                <Stack gap={2}>
                  <Kicker colorScheme="on-dark">Your Portal</Kicker>
                  <H2 className="text-white">My GVTEWAY</H2>
                </Stack>
                <Grid cols={3} gap={4}>
                  <StatCard value={events?.filter((e) => e.date && new Date(e.date) > new Date()).length.toString() || '0'} label="Upcoming Events" inverted />
                  <StatCard value="124" label="Loyalty Points" inverted />
                  <StatCard value={events?.filter((e) => e.date && new Date(e.date) < new Date()).length.toString() || '0'} label="Past Events" inverted />
                </Grid>

                <Grid cols={2} gap={6}>
                  <Card inverted className="p-6">
                    <H3 className="mb-4 text-white">Quick Access</H3>
                    <Stack gap={3}>
                      <Button variant="solid" fullWidth inverted icon={<Calendar className="size-4" />} iconPosition="left" onClick={() => router.push('/events')}>
                        Browse Events
                      </Button>
                      <Button variant="outlineInk" fullWidth icon={<Ticket className="size-4" />} iconPosition="left" onClick={() => router.push('/orders')}>
                        My Tickets
                      </Button>
                      <Button variant="outlineInk" fullWidth icon={<User className="size-4" />} iconPosition="left" onClick={() => router.push('/profile')}>
                        Edit Profile
                      </Button>
                    </Stack>
                  </Card>

                  <Card inverted className="p-6">
                    <H3 className="mb-4 text-white">Recommendations</H3>
                    <Stack gap={4}>
                      <Stack gap={1} className="pl-4" style={{ borderLeft: '4px solid #6366f1' }}>
                        <Body className="font-display text-white">Electronic Night</Body>
                        <Label size="xs" className="text-on-dark-muted">
                          Based on your preferences
                        </Label>
                      </Stack>
                      <Stack gap={1} className="pl-4" style={{ borderLeft: '4px solid #404040' }}>
                        <Body className="font-display text-white">Jazz in the Park</Body>
                        <Label size="xs" className="text-on-dark-muted">
                          Nearby • This Weekend
                        </Label>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              </Stack>
            )}
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
