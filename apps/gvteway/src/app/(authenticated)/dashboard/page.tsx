'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import {
  EnterprisePageHeader,
  MainContent,
  Container,
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
} from '@ghxstship/ui';
import { useAuth } from '@ghxstship/config/auth-context';
import { PlatformRole } from '@ghxstship/config/roles';
import { useEvents } from '@/hooks/useEvents';
import { useOrders } from '@/hooks/useOrders';
import { useActivityFeed, useSystemHealth, getHealthStatusLabel } from '@ghxstship/config/hooks';
import { LogOut, Calendar, Ticket, User, Settings, Music, Building2, BarChart3 } from 'lucide-react';

/**
 * Role-based Dashboard Router
 * Displays different dashboard views based on user's primary role
 * Bold Contemporary Pop Art Adventure aesthetic
 */
export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const { data: events, error: eventsError, refetch: refetchEvents } = useEvents();
  const { data: orders, error: ordersError, refetch: refetchOrders } = useOrders();
  const { data: activityData } = useActivityFeed({ limit: 4 });
  const { data: healthData } = useSystemHealth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !user) {
    return <GvtewayLoadingLayout text="Loading dashboard..." variant="consumer-auth" />;
  }

  const hasDataError = eventsError || ordersError;
  const handleRetry = () => {
    refetchEvents();
    refetchOrders();
  };

  if (hasDataError) {
    return (
      <GvtewayAppLayout variant="consumer-auth">
        <Stack gap={6} className="items-center justify-center py-20">
          <Card inverted className="max-w-md p-8 text-center">
            <Stack gap={4}>
              <H2 className="text-white">Error Loading Dashboard</H2>
              <Body className="text-grey-400">
                {eventsError instanceof Error ? eventsError.message : 
                 ordersError instanceof Error ? ordersError.message : 
                 'Failed to load dashboard data'}
              </Body>
              <Button variant="solid" inverted onClick={handleRetry}>
                Retry
              </Button>
            </Stack>
          </Card>
        </Stack>
      </GvtewayAppLayout>
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
    <GvtewayAppLayout variant="consumer-auth">
      <EnterprisePageHeader
        title={`Welcome back, ${user.name}`}
        subtitle={user.email}
        secondaryActions={[{ id: 'signout', label: 'Sign Out', onClick: logout, icon: <LogOut className="size-4" /> }]}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={8}>
            {/* User Roles */}
            <Stack gap={2} direction="horizontal" className="flex-wrap">
              {user.platformRoles.map(role => (
                <Badge key={role} variant="solid">
                  {role}
                </Badge>
              ))}
            </Stack>

            {/* Legend/Admin Dashboard */}
            {(hasLegendRole || isAdmin) && (
              <Stack gap={8}>
                <Stack gap={2}>
                  <Kicker colorScheme="on-dark">Administration</Kicker>
                  <H2 className="text-white">Admin Overview</H2>
                </Stack>
                <Grid cols={4} gap={4} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    value="1,247"
                    label="Total Users"
                    trend="up"
                    trendValue="+12%"
                    inverted
                    aria-label="Total Users: 1,247, up 12%"
                  />
                  <StatCard
                    value={events?.length?.toString() || '0'}
                    label="Active Events"
                    trend="up"
                    trendValue="+8%"
                    inverted
                    aria-label={`Active Events: ${events?.length || 0}, up 8%`}
                  />
                  <StatCard
                    value={orders?.length?.toString() || '0'}
                    label="Total Orders"
                    trend="up"
                    trendValue="+23%"
                    inverted
                    aria-label={`Total Orders: ${orders?.length || 0}, up 23%`}
                  />
                  <StatCard
                    value="99.8%"
                    label="Uptime"
                    trend="up"
                    trendValue="+0.2%"
                    inverted
                    aria-label="Uptime: 99.8%, up 0.2%"
                  />
                </Grid>

                <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  <Card inverted className="p-6" role="region" aria-label="Platform Access">
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

                  <Card inverted className="p-6" role="region" aria-label="System Health Status">
                    <H3 className="mb-4 text-white">System Health</H3>
                    <Stack gap={3}>
                      <Stack gap={2} direction="horizontal" className="justify-between">
                        <Body className="text-on-dark-muted">API Response</Body>
                        <Body size="sm" className="font-display text-white">{healthData?.apiResponseTime || 45}ms</Body>
                      </Stack>
                      <Stack gap={2} direction="horizontal" className="justify-between">
                        <Body className="text-on-dark-muted">Database</Body>
                        <Body size="sm" className="font-display text-success">{getHealthStatusLabel(healthData?.databaseStatus || 'healthy')}</Body>
                      </Stack>
                      <Stack gap={2} direction="horizontal" className="justify-between">
                        <Body className="text-on-dark-muted">Cache Hit</Body>
                        <Body size="sm" className="font-display text-white">{healthData?.cacheHitRate || 94}%</Body>
                      </Stack>
                    </Stack>
                  </Card>

                  <Card inverted className="p-6" role="region" aria-label="Recent Activity">
                    <H3 className="mb-4 text-white">Recent Activity</H3>
                    <Stack gap={2} role="feed" aria-label="Activity updates">
                      {(activityData || [
                        { id: '1', action: 'New event created', detail: 'Summer Fest' },
                        { id: '2', action: 'User registered', detail: 'john@example.com' },
                        { id: '3', action: 'Order completed', detail: '#12847' },
                        { id: '4', action: 'Ticket scanned', detail: 'VIP-002341' },
                      ]).map((activity) => (
                        <Body key={activity.id} size="sm" className="text-on-dark-muted" role="article" aria-label={`${activity.action}: ${activity.detail}`}>
                          {activity.action}: {activity.detail}
                        </Body>
                      ))}
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
                <Grid cols={4} gap={4} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard value="12" label="Active Events" inverted aria-label="Active Events: 12" />
                  <StatCard value="3,421" label="Tickets Sold" inverted aria-label="Tickets Sold: 3,421" />
                  <StatCard value="$45.2K" label="Revenue" inverted aria-label="Revenue: $45.2K" />
                  <StatCard value="4.8" label="Avg Rating" inverted aria-label="Average Rating: 4.8" />
                </Grid>

                <Grid cols={2} gap={6} className="grid-cols-1 lg:grid-cols-2">
                  <Card inverted className="p-6" role="region" aria-label="Quick Actions">
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

                  <Card inverted className="p-6" role="region" aria-label="Upcoming Events">
                    <H3 className="mb-4 text-white">Upcoming Events</H3>
                    <Stack gap={4}>
                      <Stack gap={1} className="border-l-4 border-primary pl-4">
                        <Body className="font-display text-white">Summer Music Festival</Body>
                        <Label size="xs" className="text-on-dark-muted">
                          June 15, 2024 • 342 tickets sold
                        </Label>
                      </Stack>
                      <Stack gap={1} className="border-l-4 border-ink-700 pl-4">
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
                <Grid cols={4} gap={4} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard value="3" label="Active Venues" inverted aria-label="Active Venues: 3" />
                  <StatCard value="28" label="Events This Month" inverted aria-label="Events This Month: 28" />
                  <StatCard value="5,234" label="Total Capacity" inverted aria-label="Total Capacity: 5,234" />
                  <StatCard value="87%" label="Avg Utilization" inverted aria-label="Average Utilization: 87%" />
                </Grid>

                <Card inverted className="p-6">
                  <H3 className="mb-4 text-white">Your Venues</H3>
                  <Stack gap={4}>
                    <Card inverted interactive onClick={() => router.push('/venues/main-stage')} onKeyDown={(e) => e.key === 'Enter' && router.push('/venues/main-stage')} role="button" tabIndex={0} aria-label="Main Stage Theater - Capacity 2,000, Next Event in 3 days">
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
                <Grid cols={4} gap={4} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard value="8" label="Upcoming Shows" inverted aria-label="Upcoming Shows: 8" />
                  <StatCard value="12.4K" label="Followers" inverted aria-label="Followers: 12.4K" />
                  <StatCard value="1,234" label="Tracks Sold" inverted aria-label="Tracks Sold: 1,234" />
                  <StatCard value="$8.2K" label="Earnings" inverted aria-label="Earnings: $8.2K" />
                </Grid>

                <Grid cols={2} gap={6} className="grid-cols-1 lg:grid-cols-2">
                  <Card inverted className="p-6" role="region" aria-label="Profile and Content Actions">
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

                  <Card inverted className="p-6" role="region" aria-label="Fan Engagement Statistics">
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
                <Grid cols={3} gap={4} className="grid-cols-1 sm:grid-cols-3">
                  <StatCard value={events?.filter((e) => e.date && new Date(e.date) > new Date()).length.toString() || '0'} label="Upcoming Events" inverted aria-label={`Upcoming Events: ${events?.filter((e) => e.date && new Date(e.date) > new Date()).length || 0}`} />
                  <StatCard value="124" label="Loyalty Points" inverted aria-label="Loyalty Points: 124" />
                  <StatCard value={events?.filter((e) => e.date && new Date(e.date) < new Date()).length.toString() || '0'} label="Past Events" inverted aria-label={`Past Events: ${events?.filter((e) => e.date && new Date(e.date) < new Date()).length || 0}`} />
                </Grid>

                <Grid cols={2} gap={6} className="grid-cols-1 lg:grid-cols-2">
                  <Card inverted className="p-6" role="region" aria-label="Quick Access">
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

                  <Card inverted className="p-6" role="region" aria-label="Event Recommendations">
                    <H3 className="mb-4 text-white">Recommendations</H3>
                    <Stack gap={4}>
                      <Stack gap={1} className="border-l-4 border-primary pl-4">
                        <Body className="font-display text-white">Electronic Night</Body>
                        <Label size="xs" className="text-on-dark-muted">
                          Based on your preferences
                        </Label>
                      </Stack>
                      <Stack gap={1} className="border-l-4 border-ink-700 pl-4">
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
      </MainContent>
    </GvtewayAppLayout>
  );
}
