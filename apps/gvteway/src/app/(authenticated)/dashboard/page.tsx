"use client";

/**
 * GVTEWAY Dashboard Page
 * Role-based dashboard with different views for different user types
 * Uses DetailPage template for consistent layout with loading/error states
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GvtewayLoadingLayout } from "@/components/app-layout";
import {
  Body,
  Box,
  Button,
  Card,
  StatCard,
  Grid,
  Badge,
  Label,
  Section,
  SectionHeader,
  Stack,
  DetailPage,
} from "@ghxstship/ui";
import { useAuth } from "@ghxstship/config/auth-context";
import { PlatformRole } from "@ghxstship/config/roles";
import { useEvents } from "@/hooks/useEvents";
import { useOrders } from "@/hooks/useOrders";
import { useActivityFeed, useSystemHealth, getHealthStatusLabel } from "@ghxstship/config/hooks";
import { Calendar, Ticket, User, Music, Building2, BarChart3, Settings, Home } from "lucide-react";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { data: events, error: eventsError, refetch: refetchEvents } = useEvents();
  const { data: orders, error: ordersError, refetch: refetchOrders } = useOrders();
  const { data: activityData } = useActivityFeed({ limit: 4 });
  const { data: healthData } = useSystemHealth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
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

  const hasLegendRole = user.platformRoles.some((r) => r.startsWith("LEGEND_"));
  const isAdmin = user.platformRoles.some((r) => r.includes("ADMIN"));
  const isExperienceCreator = user.platformRoles.includes(PlatformRole.GVTEWAY_EXPERIENCE_CREATOR);
  const isVenueManager = user.platformRoles.includes(PlatformRole.GVTEWAY_VENUE_MANAGER);
  const isArtist = user.platformRoles.some((r) => r.includes("ARTIST"));

  const fallbackActivity = [
    { id: "1", action: "New event created", detail: "Summer Fest" },
    { id: "2", action: "User registered", detail: "john@example.com" },
    { id: "3", action: "Order completed", detail: "#12847" },
    { id: "4", action: "Ticket scanned", detail: "VIP-002341" },
  ];

  // Build tabs based on user roles
  const tabs = [];

  tabs.push({
    id: "overview",
    label: "Overview",
    icon: <Home className="size-4" />,
    content: (
      <>
        {/* User Roles */}
        <Stack direction="horizontal" className="flex-wrap gap-2 mb-6">
          {user.platformRoles.map((role) => (
            <Badge key={role} variant="solid">
              {role}
            </Badge>
          ))}
        </Stack>

        {/* Legend/Admin Dashboard */}
        {(hasLegendRole || isAdmin) && (
          <Section border className="mb-6">
            <SectionHeader
              kicker="Administration"
              title="Admin Overview"
              description="Platform-wide metrics and system health"
            />
            <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
              <StatCard value="1,247" label="Total Users" />
              <StatCard value={events?.length?.toString() || "0"} label="Active Events" />
              <StatCard value={orders?.length?.toString() || "0"} label="Total Orders" />
              <StatCard value="99.8%" label="Uptime" />
            </Grid>

            <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3">
              <Card inverted className="p-4">
                <Body className="text-white font-weight-medium mb-3">Platform Access</Body>
                <Stack gap={2}>
                  <Button variant="solid" className="w-full" onClick={() => router.push("/admin/atlvs")}>
                    ATLVS Admin
                  </Button>
                  <Button variant="outline" inverted className="w-full" onClick={() => router.push("/admin/compvss")}>
                    COMPVSS Admin
                  </Button>
                  <Button variant="outline" inverted className="w-full" onClick={() => router.push("/admin/gvteway")}>
                    GVTEWAY Admin
                  </Button>
                </Stack>
              </Card>

              <Card inverted className="p-4">
                <Body className="text-white font-weight-medium mb-3">System Health</Body>
                <Stack gap={2}>
                  <Stack direction="horizontal" className="justify-between">
                    <Body size="sm" className="text-on-dark-muted">API Response</Body>
                    <Body size="sm" className="text-white">{healthData?.apiResponseTime || 45}ms</Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Body size="sm" className="text-on-dark-muted">Database</Body>
                    <Body size="sm" className="text-success">{getHealthStatusLabel(healthData?.databaseStatus || "healthy")}</Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Body size="sm" className="text-on-dark-muted">Cache Hit</Body>
                    <Body size="sm" className="text-white">{healthData?.cacheHitRate || 94}%</Body>
                  </Stack>
                </Stack>
              </Card>

              <Card inverted className="p-4">
                <Body className="text-white font-weight-medium mb-3">Recent Activity</Body>
                <Stack gap={2}>
                  {(activityData || fallbackActivity).map((activity) => (
                    <Body key={activity.id} size="sm" className="text-on-dark-muted">
                      {activity.action}: {activity.detail}
                    </Body>
                  ))}
                </Stack>
              </Card>
            </Grid>
          </Section>
        )}

        {/* Experience Creator Dashboard */}
        {isExperienceCreator && (
          <Section border className="mb-6">
            <SectionHeader
              kicker="Creator Portal"
              title="Your Experiences"
              description="Manage your events and track performance"
            />
            <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
              <StatCard value="12" label="Active Events" />
              <StatCard value="3,421" label="Tickets Sold" />
              <StatCard value="$45.2K" label="Revenue" />
              <StatCard value="4.8" label="Avg Rating" />
            </Grid>

            <Grid cols={2} gap={4} className="grid-cols-1 lg:grid-cols-2">
              <Card inverted className="p-4">
                <Body className="text-white font-weight-medium mb-3">Quick Actions</Body>
                <Stack gap={2}>
                  <Button variant="solid" className="w-full" icon={<Calendar className="size-4" />} iconPosition="left" onClick={() => router.push("/events/new")}>
                    Create New Event
                  </Button>
                  <Button variant="outline" inverted className="w-full" icon={<Settings className="size-4" />} iconPosition="left" onClick={() => router.push("/events/manage")}>
                    Manage Events
                  </Button>
                  <Button variant="outline" inverted className="w-full" icon={<BarChart3 className="size-4" />} iconPosition="left" onClick={() => router.push("/analytics")}>
                    View Analytics
                  </Button>
                </Stack>
              </Card>

              <Card inverted className="p-4">
                <Body className="text-white font-weight-medium mb-3">Upcoming Events</Body>
                <Stack gap={3}>
                  <Box className="border-l-4 border-primary pl-4">
                    <Body className="text-white">Summer Music Festival</Body>
                    <Label size="xs" className="text-on-dark-muted">June 15, 2024 • 342 tickets sold</Label>
                  </Box>
                  <Box className="border-l-4 border-grey-700 pl-4">
                    <Body className="text-white">Rock Concert Series</Body>
                    <Label size="xs" className="text-on-dark-muted">July 20, 2024 • 156 tickets sold</Label>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          </Section>
        )}

        {/* Venue Manager Dashboard */}
        {isVenueManager && (
          <Section border className="mb-6">
            <SectionHeader
              kicker="Venue Portal"
              title="Venue Management"
              description="Manage your venues and bookings"
            />
            <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
              <StatCard value="3" label="Active Venues" />
              <StatCard value="28" label="Events This Month" />
              <StatCard value="5,234" label="Total Capacity" />
              <StatCard value="87%" label="Avg Utilization" />
            </Grid>

            <Card inverted className="p-4">
              <Body className="text-white font-weight-medium mb-3">Your Venues</Body>
              <Card inverted className="p-4 cursor-pointer hover:bg-grey-800" onClick={() => router.push("/venues/main-stage")}>
                <Stack direction="horizontal" className="items-center justify-between">
                  <Stack gap={0}>
                    <Body className="text-white">Main Stage Theater</Body>
                    <Label size="xs" className="text-on-dark-muted">Capacity: 2,000 • Next Event: 3 days</Label>
                  </Stack>
                  <Button variant="outline" inverted size="sm" icon={<Building2 className="size-4" />} iconPosition="left">
                    Manage
                  </Button>
                </Stack>
              </Card>
            </Card>
          </Section>
        )}

        {/* Artist Dashboard */}
        {isArtist && (
          <Section border className="mb-6">
            <SectionHeader
              kicker="Artist Portal"
              title="Your Music"
              description="Manage your profile, music, and merchandise"
            />
            <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
              <StatCard value="8" label="Upcoming Shows" />
              <StatCard value="12.4K" label="Followers" />
              <StatCard value="1,234" label="Tracks Sold" />
              <StatCard value="$8.2K" label="Earnings" />
            </Grid>

            <Grid cols={2} gap={4} className="grid-cols-1 lg:grid-cols-2">
              <Card inverted className="p-4">
                <Body className="text-white font-weight-medium mb-3">Profile & Content</Body>
                <Stack gap={2}>
                  <Button variant="solid" className="w-full" icon={<User className="size-4" />} iconPosition="left" onClick={() => router.push("/artist/profile")}>
                    Edit Profile
                  </Button>
                  <Button variant="outline" inverted className="w-full" icon={<Music className="size-4" />} iconPosition="left" onClick={() => router.push("/artist/music/upload")}>
                    Upload Music
                  </Button>
                  <Button variant="outline" inverted className="w-full" onClick={() => router.push("/artist/merch")}>
                    Manage Merchandise
                  </Button>
                </Stack>
              </Card>

              <Card inverted className="p-4">
                <Body className="text-white font-weight-medium mb-3">Fan Engagement</Body>
                <Stack gap={2}>
                  <Stack direction="horizontal" className="justify-between">
                    <Body size="sm" className="text-on-dark-muted">New Followers (7d)</Body>
                    <Body size="sm" className="text-white">+342</Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Body size="sm" className="text-on-dark-muted">Avg. Engagement</Body>
                    <Body size="sm" className="text-white">8.4%</Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Body size="sm" className="text-on-dark-muted">Messages</Body>
                    <Body size="sm" className="text-white">23 unread</Body>
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </Section>
        )}

        {/* Default Member Dashboard */}
        {!hasLegendRole && !isAdmin && !isExperienceCreator && !isVenueManager && !isArtist && (
          <Section border>
            <SectionHeader
              kicker="Your Portal"
              title="My GVTEWAY"
              description="Your events, tickets, and recommendations"
            />
            <Grid cols={3} gap={4} className="grid-cols-1 sm:grid-cols-3 mb-6">
              <StatCard value={events?.filter((e) => e.date && new Date(e.date) > new Date()).length?.toString() || "0"} label="Upcoming Events" />
              <StatCard value="124" label="Loyalty Points" />
              <StatCard value={events?.filter((e) => e.date && new Date(e.date) < new Date()).length?.toString() || "0"} label="Past Events" />
            </Grid>

            <Grid cols={2} gap={4} className="grid-cols-1 lg:grid-cols-2">
              <Card inverted className="p-4">
                <Body className="text-white font-weight-medium mb-3">Quick Access</Body>
                <Stack gap={2}>
                  <Button variant="solid" className="w-full" icon={<Calendar className="size-4" />} iconPosition="left" onClick={() => router.push("/events")}>
                    Browse Events
                  </Button>
                  <Button variant="outline" inverted className="w-full" icon={<Ticket className="size-4" />} iconPosition="left" onClick={() => router.push("/orders")}>
                    My Tickets
                  </Button>
                  <Button variant="outline" inverted className="w-full" icon={<User className="size-4" />} iconPosition="left" onClick={() => router.push("/profile")}>
                    Edit Profile
                  </Button>
                </Stack>
              </Card>

              <Card inverted className="p-4">
                <Body className="text-white font-weight-medium mb-3">Recommendations</Body>
                <Stack gap={3}>
                  <Box className="border-l-4 border-primary pl-4">
                    <Body className="text-white">Electronic Night</Body>
                    <Label size="xs" className="text-on-dark-muted">Based on your preferences</Label>
                  </Box>
                  <Box className="border-l-4 border-grey-700 pl-4">
                    <Body className="text-white">Jazz in the Park</Body>
                    <Label size="xs" className="text-on-dark-muted">Nearby • This Weekend</Label>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          </Section>
        )}
      </>
    ),
  });

  return (
    <DetailPage
      header={{
        kicker: "GVTEWAY",
        title: `Welcome back, ${user.name}`,
        description: user.email,
      }}
      loading={false}
      error={hasDataError ? (eventsError instanceof Error ? eventsError : ordersError instanceof Error ? ordersError : new Error("Failed to load dashboard")) : null}
      onRetry={handleRetry}
      tabs={tabs}
    />
  );
}
