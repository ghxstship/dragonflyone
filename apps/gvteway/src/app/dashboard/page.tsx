'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../components/navigation';
import {
  Container,
  Section,
  H1,
  H2,
  Body,
  Button,
  Card,
  StatCard,
  Grid,
  Stack,
  Badge,
  LoadingSpinner,
} from '@ghxstship/ui';
import { useAuth } from '@ghxstship/config/auth-context';
import { PlatformRole } from '@ghxstship/config/roles';
import { useEvents } from '@/hooks/useEvents';
import { useOrders } from '@/hooks/useOrders';

/**
 * Role-based Dashboard Router
 * Displays different dashboard views based on user's primary role
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
      <Section className="min-h-screen bg-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </Container>
      </Section>
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
    <Section className="min-h-screen bg-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
        {/* Header */}
        <Stack gap={4} direction="horizontal" className="justify-between items-start border-b-2 border-black pb-8">
          <Stack gap={2}>
            <H1>{user.name}</H1>
              <Body variant="muted">{user.email}</Body>
              <Stack gap={2} direction="horizontal" className="flex-wrap mt-2">
                {user.platformRoles.map(role => (
                  <Badge key={role} variant="solid">
                    {role}
                  </Badge>
                ))}
              </Stack>
            </Stack>
            <Button variant="outline" onClick={logout}>
              Sign Out
            </Button>
        </Stack>

        {/* Legend/Admin Dashboard */}
        {(hasLegendRole || isAdmin) && (
          <>
            <H2 className="mb-6">ADMIN OVERVIEW</H2>
            <Grid columns={4} gap="md" className="mb-8">
              <StatCard
                value="1,247"
                label="Total Users"
                trend="up"
                trendValue="+12%"
              />
              <StatCard
                value={events?.length?.toString() || '0'}
                label="Active Events"
                trend="up"
                trendValue="+8%"
              />
              <StatCard
                value={orders?.length?.toString() || '0'}
                label="Total Orders"
                trend="up"
                trendValue="+23%"
              />
              <StatCard
                value="99.8%"
                label="Uptime"
                trend="up"
                trendValue="+0.2%"
              />
            </Grid>

            <Grid columns={3} gap="md" className="mb-8">
              <Card className="p-6">
                <H2 className="mb-4">PLATFORM ACCESS</H2>
                <Stack gap={3}>
                  <Button variant="solid" fullWidth onClick={() => router.push('/admin/atlvs')}>
                    ATLVS Admin
                  </Button>
                  <Button variant="solid" fullWidth onClick={() => router.push('/admin/compvss')}>
                    COMPVSS Admin
                  </Button>
                  <Button variant="solid" fullWidth onClick={() => router.push('/admin/gvteway')}>
                    GVTEWAY Admin
                  </Button>
                </Stack>
              </Card>

              <Card className="p-6">
                <H2 className="mb-4">SYSTEM HEALTH</H2>
                <Stack gap={2}>
                  <Stack gap={2} direction="horizontal" className="justify-between">
                    <Body>API Response</Body>
                    <Body className="font-bold">45ms</Body>
                  </Stack>
                  <Stack gap={2} direction="horizontal" className="justify-between">
                    <Body>Database</Body>
                    <Body className="font-bold text-success-600">Healthy</Body>
                  </Stack>
                  <Stack gap={2} direction="horizontal" className="justify-between">
                    <Body>Cache Hit</Body>
                    <Body className="font-bold">94%</Body>
                  </Stack>
                </Stack>
              </Card>

              <Card className="p-6">
                <H2 className="mb-4">RECENT ACTIVITY</H2>
                <Stack gap={2} className="text-sm">
                  <Body variant="muted">New event created: Summer Fest</Body>
                  <Body variant="muted">User registered: john@example.com</Body>
                  <Body variant="muted">Order completed: #12847</Body>
                  <Body variant="muted">Ticket scanned: VIP-002341</Body>
                </Stack>
              </Card>
            </Grid>
          </>
        )}

        {/* Experience Creator Dashboard */}
        {isExperienceCreator && (
          <>
            <H2 className="mb-6">YOUR EXPERIENCES</H2>
            <Grid columns={4} gap="md" className="mb-8">
              <StatCard value="12" label="Active Events" />
              <StatCard value="3,421" label="Tickets Sold" />
              <StatCard value="$45.2K" label="Revenue" />
              <StatCard value="4.8" label="Avg Rating" />
            </Grid>

            <Grid columns={2} gap="md">
              <Card className="p-6">
                <H2 className="mb-4">QUICK ACTIONS</H2>
                <Stack gap={3}>
                  <Button variant="solid" fullWidth onClick={() => router.push('/events/new')}>
                    Create New Event
                  </Button>
                  <Button variant="outline" fullWidth onClick={() => router.push('/events/manage')}>
                    Manage Events
                  </Button>
                  <Button variant="outline" fullWidth onClick={() => router.push('/analytics')}>
                    View Analytics
                  </Button>
                </Stack>
              </Card>

              <Card className="p-6">
                <H2 className="mb-4">UPCOMING EVENTS</H2>
                <Stack gap={3}>
                  <Stack gap={1} className="border-l-4 border-black pl-4">
                    <Body className="font-bold">Summer Music Festival</Body>
                    <Body variant="muted" className="text-sm">
                      June 15, 2024 • 342 tickets sold
                    </Body>
                  </Stack>
                  <Stack gap={1} className="border-l-4 border-grey-400 pl-4">
                    <Body className="font-bold">Rock Concert Series</Body>
                    <Body variant="muted" className="text-sm">
                      July 20, 2024 • 156 tickets sold
                    </Body>
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </>
        )}

        {/* Venue Manager Dashboard */}
        {isVenueManager && (
          <>
            <H2 className="mb-6">VENUE MANAGEMENT</H2>
            <Grid columns={4} gap="md" className="mb-8">
              <StatCard value="3" label="Active Venues" />
              <StatCard value="28" label="Events This Month" />
              <StatCard value="5,234" label="Total Capacity" />
              <StatCard value="87%" label="Avg Utilization" />
            </Grid>

            <Card className="p-6">
              <H2 className="mb-4">YOUR VENUES</H2>
              <Stack gap={4}>
                <Card className="border-2 border-black p-4">
                  <Body className="font-bold text-lg">Main Stage Theater</Body>
                  <Body variant="muted">Capacity: 2,000 • Next Event: 3 days</Body>
                  <Stack gap={2} className="mt-2">
                    <Button variant="outline" size="sm" onClick={() => router.push('/venues/main-stage')}>
                      Manage
                    </Button>
                  </Stack>
                </Card>
              </Stack>
            </Card>
          </>
        )}

        {/* Artist Dashboard */}
        {isArtist && (
          <>
            <H2 className="mb-6">ARTIST PORTAL</H2>
            <Grid columns={4} gap="md" className="mb-8">
              <StatCard value="8" label="Upcoming Shows" />
              <StatCard value="12.4K" label="Followers" />
              <StatCard value="1,234" label="Tracks Sold" />
              <StatCard value="$8.2K" label="Earnings" />
            </Grid>

            <Grid columns={2} gap="md">
              <Card className="p-6">
                <H2 className="mb-4">PROFILE & CONTENT</H2>
                <Stack gap={3}>
                  <Button variant="solid" fullWidth onClick={() => router.push('/artist/profile')}>
                    Edit Profile
                  </Button>
                  <Button variant="outline" fullWidth onClick={() => router.push('/artist/music/upload')}>
                    Upload Music
                  </Button>
                  <Button variant="outline" fullWidth onClick={() => router.push('/artist/merch')}>
                    Manage Merchandise
                  </Button>
                </Stack>
              </Card>

              <Card className="p-6">
                <H2 className="mb-4">FAN ENGAGEMENT</H2>
                <Stack gap={2}>
                  <Stack gap={2} direction="horizontal" className="justify-between">
                    <Body>New Followers (7d)</Body>
                    <Body className="font-bold">+342</Body>
                  </Stack>
                  <Stack gap={2} direction="horizontal" className="justify-between">
                    <Body>Avg. Engagement</Body>
                    <Body className="font-bold">8.4%</Body>
                  </Stack>
                  <Stack gap={2} direction="horizontal" className="justify-between">
                    <Body>Messages</Body>
                    <Body className="font-bold">23 unread</Body>
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </>
        )}

        {/* Default Member Dashboard */}
        {!hasLegendRole && !isAdmin && !isExperienceCreator && !isVenueManager && !isArtist && (
          <>
            <H2 className="mb-6">MY GVTEWAY</H2>
            <Grid columns={3} gap="md" className="mb-8">
              <StatCard value={events?.filter((e: any) => new Date(e.date) > new Date()).length.toString() || '0'} label="Upcoming Events" />
              <StatCard value="124" label="Loyalty Points" />
              <StatCard value={events?.filter((e: any) => new Date(e.date) < new Date()).length.toString() || '0'} label="Past Events" />
            </Grid>

            <Grid columns={2} gap="md">
              <Card className="p-6">
                <H2 className="mb-4">QUICK ACCESS</H2>
                <Stack gap={3}>
                  <Button variant="solid" fullWidth onClick={() => router.push('/events')}>
                    Browse Events
                  </Button>
                  <Button variant="outline" fullWidth onClick={() => router.push('/orders')}>
                    My Tickets
                  </Button>
                  <Button variant="outline" fullWidth onClick={() => router.push('/profile')}>
                    Edit Profile
                  </Button>
                </Stack>
              </Card>

              <Card className="p-6">
                <H2 className="mb-4">RECOMMENDATIONS</H2>
                <Stack gap={3}>
                  <Stack gap={1} className="border-l-4 border-black pl-4">
                    <Body className="font-bold">Electronic Night</Body>
                    <Body variant="muted" className="text-sm">
                      Based on your preferences
                    </Body>
                  </Stack>
                  <Stack gap={1} className="border-l-4 border-grey-400 pl-4">
                    <Body className="font-bold">Jazz in the Park</Body>
                    <Body variant="muted" className="text-sm">
                      Nearby • This Weekend
                    </Body>
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </>
        )}
        </Stack>
      </Container>
    </Section>
  );
}
