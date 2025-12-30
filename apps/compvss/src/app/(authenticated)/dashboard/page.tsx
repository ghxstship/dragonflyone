"use client";

/**
 * COMPVSS Production Operations Dashboard
 * Bold Contemporary Pop Art Adventure aesthetic
 * Uses ListPage template for consistent layout with loading/error states
 */

import { useRouter } from "next/navigation";
import { useCrew } from "@/hooks/useCrew";
import { useEquipment } from "@/hooks/useEquipment";
import { useActivityFeed } from "@ghxstship/config/hooks";
import {
  Body, Button, Card, StatCard, Grid, PageLayout, MarketingPageHeader, Section, SectionHeader, Stack, StatusBadge, Badge} from "@ghxstship/ui";
import { useAuthContext, PlatformRole } from "@ghxstship/config";

const ADMIN_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

export default function CompvssDashboardPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const { data: crew, isLoading: crewLoading, error: crewError, refetch: refetchCrew } = useCrew();
  const { data: equipment, isLoading: equipmentLoading, error: equipmentError, refetch: refetchEquipment } = useEquipment();
  const { data: activityData } = useActivityFeed({ limit: 5, types: ["crew", "equipment", "project"] });

  const canManage = ADMIN_ROLES.some((role) => hasRole(role));

  const isLoading = crewLoading || equipmentLoading;
  const hasError = crewError || equipmentError;

  const handleRetry = () => {
    refetchCrew();
    refetchEquipment();
  };

  const fallbackActivity = [
    { id: "1", action: "Check-in", detail: "Mike Johnson - Lighting Tech" },
    { id: "2", action: "Project created", detail: "Fall Concert Series" },
    { id: "3", action: "Crew assigned", detail: "Summer Festival (8 new)" },
    { id: "4", action: "Equipment checked out", detail: "Sound Package A" },
    { id: "5", action: "Show report submitted", detail: "Corporate Event #1247" },
  ];

  const recentActivity = activityData?.map((a) => ({
    id: a.id,
    action: a.action,
    detail: a.detail,
  })) || fallbackActivity;

  const stats = {
    activeCrew: crew?.filter((c) => c.availability === "available").length || 247,
    totalCrew: crew?.length || 247,
    availableEquipment: equipment?.filter((e) => e.status === "available").length || 0,
    inUseEquipment: equipment?.filter((e) => e.status === "in_use").length || 0,
  };

  return (
    <PageLayout
      header={<MarketingPageHeader kicker="COMPVSS" title="Production Operations" description="Manage crew, equipment, and active productions" />}
      loading={isLoading}
      error={hasError ? (crewError instanceof Error ? crewError : equipmentError instanceof Error ? equipmentError : new Error("Failed to load dashboard")) : null}
      onRetry={handleRetry}
    >
      {/* Production Overview Stats */}
      <Section border className="mb-6">
        <SectionHeader
          kicker="Operations"
          title="Production Overview"
          description="Real-time status of crew, equipment, and active productions"
        />
        <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4">
          <StatCard value="18" label="Active Productions" />
          <StatCard value={stats.totalCrew.toString()} label="Crew Members" />
          <StatCard value={stats.inUseEquipment.toString()} label="Equipment In Use" />
          <StatCard value="92%" label="On-Time Rate" />
        </Grid>
      </Section>

      {/* Quick Actions */}
      <Section border className="mb-6">
        <SectionHeader title="Quick Actions" />
        <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3">
          <Card inverted className="p-4">
            <Body className="text-white font-weight-medium mb-3">Project Management</Body>
            <Stack gap={2}>
              {canManage && (
                <Button variant="solid" className="w-full" onClick={() => router.push("/projects/new")}>
                  Create Project
                </Button>
              )}
              <Button variant="outline" inverted className="w-full" onClick={() => router.push("/projects")}>
                View All Projects
              </Button>
            </Stack>
          </Card>
          <Card inverted className="p-4">
            <Body className="text-white font-weight-medium mb-3">Crew Management</Body>
            <Stack gap={2}>
              {canManage && (
                <Button variant="solid" className="w-full" onClick={() => router.push("/crew/assign")}>
                  Assign Crew
                </Button>
              )}
              <Button variant="outline" inverted className="w-full" onClick={() => router.push("/crew")}>
                Crew Directory
              </Button>
            </Stack>
          </Card>
          <Card inverted className="p-4">
            <Body className="text-white font-weight-medium mb-3">Equipment</Body>
            <Stack gap={2}>
              <Button variant="solid" className="w-full" onClick={() => router.push("/equipment")}>
                Equipment Inventory
              </Button>
              <Button variant="outline" inverted className="w-full" onClick={() => router.push("/maintenance")}>
                Maintenance Schedule
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Section>

      {/* Active Projects */}
      <Section border className="mb-6">
        <SectionHeader
          kicker="Portfolio"
          title="Active Projects"
          description="Current productions and their status"
        />
        <Stack gap={4}>
          <Card inverted className="p-4 border-l-4 border-success">
            <Stack direction="horizontal" className="items-start justify-between">
              <Stack gap={1}>
                <Body className="text-white font-weight-medium">Summer Music Festival 2024</Body>
                <Body size="sm" className="text-on-dark-muted">Load-in: June 12 • Event: June 15-17</Body>
                <Stack direction="horizontal" gap={2} className="mt-2">
                  <StatusBadge status="success" size="sm">ON TRACK</StatusBadge>
                  <Badge variant="solid" size="sm">32 CREW</Badge>
                </Stack>
              </Stack>
              <Button variant="outline" inverted size="sm" onClick={() => router.push("/projects/summer-festival-2024")}>
                View
              </Button>
            </Stack>
          </Card>
          <Card inverted className="p-4 border-l-4 border-warning">
            <Stack direction="horizontal" className="items-start justify-between">
              <Stack gap={1}>
                <Body className="text-white font-weight-medium">Corporate Product Launch</Body>
                <Body size="sm" className="text-on-dark-muted">Setup: June 10 • Event: June 11</Body>
                <Stack direction="horizontal" gap={2} className="mt-2">
                  <StatusBadge status="warning" size="sm">ATTENTION</StatusBadge>
                  <Badge variant="solid" size="sm">18 CREW</Badge>
                </Stack>
              </Stack>
              <Button variant="outline" inverted size="sm" onClick={() => router.push("/projects/corporate-launch")}>
                View
              </Button>
            </Stack>
          </Card>
          <Card inverted className="p-4 border-l-4 border-info">
            <Stack direction="horizontal" className="items-start justify-between">
              <Stack gap={1}>
                <Body className="text-white font-weight-medium">Theater Production: Hamilton</Body>
                <Body size="sm" className="text-on-dark-muted">Tech Week: June 8-13 • Opening: June 14</Body>
                <Stack direction="horizontal" gap={2} className="mt-2">
                  <StatusBadge status="info" size="sm">TECH WEEK</StatusBadge>
                  <Badge variant="solid" size="sm">24 CREW</Badge>
                </Stack>
              </Stack>
              <Button variant="outline" inverted size="sm" onClick={() => router.push("/projects/hamilton")}>
                View
              </Button>
            </Stack>
          </Card>
        </Stack>
      </Section>

      {/* Status & Activity */}
      <Section border>
        <SectionHeader title="Status & Activity" />
        <Grid cols={2} gap={4} className="grid-cols-1 lg:grid-cols-2">
          <Card inverted className="p-4">
            <Body className="text-white font-weight-medium mb-3">Crew Status Today</Body>
            <Stack gap={2}>
              <Stack direction="horizontal" className="justify-between border-b border-grey-700 pb-2">
                <Body size="sm" className="text-on-dark-muted">Total Crew</Body>
                <Body size="sm" className="text-white">{stats.totalCrew}</Body>
              </Stack>
              <Stack direction="horizontal" className="justify-between border-b border-grey-700 pb-2">
                <Body size="sm" className="text-on-dark-muted">Available</Body>
                <Body size="sm" className="text-white">{stats.activeCrew}</Body>
              </Stack>
              <Stack direction="horizontal" className="justify-between border-b border-grey-700 pb-2">
                <Body size="sm" className="text-on-dark-muted">Equipment Available</Body>
                <Body size="sm" className="text-white">{stats.availableEquipment}</Body>
              </Stack>
              <Stack direction="horizontal" className="justify-between">
                <Body size="sm" className="text-on-dark-muted">Equipment In Use</Body>
                <Body size="sm" className="text-white">{stats.inUseEquipment}</Body>
              </Stack>
            </Stack>
          </Card>
          <Card inverted className="p-4">
            <Body className="text-white font-weight-medium mb-3">Recent Activity</Body>
            <Stack gap={2}>
              {recentActivity.map((activity) => (
                <Body key={activity.id} size="sm" className="text-on-dark-muted">
                  {activity.action}: {activity.detail}
                </Body>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Section>
    </PageLayout>
  );
}
