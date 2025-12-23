'use client';

import { useRouter } from 'next/navigation';
// Layout provided by route group
import { useCrew } from '../../../hooks/useCrew';
import { useEquipment } from '../../../hooks/useEquipment';
import { useActivityFeed } from '@ghxstship/config/hooks';
import {
  H2,
  H3,
  Body,
  Button,
  Card,
  StatCard,
  Grid,
  Stack,
  StatusBadge,
  Badge,
  Spinner,
  EnterprisePageHeader,
  MainContent,
  Container,
} from '@ghxstship/ui';

/**
 * COMPVSS Production Operations Dashboard
 * Bold Contemporary Pop Art Adventure aesthetic
 * Hard offset shadows, 2px+ borders, bounce animations
 */
export default function CompvssDashboardPage() {
  const router = useRouter();
  const { data: crew, isLoading: crewLoading, error: crewError, refetch: refetchCrew } = useCrew();
  const { data: equipment, isLoading: equipmentLoading, error: equipmentError, refetch: refetchEquipment } = useEquipment();
  const { data: activityData } = useActivityFeed({ limit: 5, types: ['crew', 'equipment', 'project'] });

  // Mock user - in production this would come from auth context
  const user = {
    name: 'Production Manager',
    role: 'COMPVSS_ADMIN',
  };

  const isLoading = crewLoading || equipmentLoading;
  const hasError = crewError || equipmentError;

  const handleRetry = () => {
    refetchCrew();
    refetchEquipment();
  };

  // Fallback activity data
  const fallbackActivity = [
    { id: '1', action: 'Check-in', detail: 'Mike Johnson - Lighting Tech' },
    { id: '2', action: 'Project created', detail: 'Fall Concert Series' },
    { id: '3', action: 'Crew assigned', detail: 'Summer Festival (8 new)' },
    { id: '4', action: 'Equipment checked out', detail: 'Sound Package A' },
    { id: '5', action: 'Show report submitted', detail: 'Corporate Event #1247' },
  ];

  const recentActivity = activityData?.map(a => ({
    id: a.id,
    action: a.action,
    detail: a.detail,
  })) || fallbackActivity;

  // Calculate real stats
  const stats = {
    activeCrew: crew?.filter(c => c.availability === 'available').length || 247,
    totalCrew: crew?.length || 247,
    availableEquipment: equipment?.filter(e => e.status === 'available').length || 0,
    inUseEquipment: equipment?.filter(e => e.status === 'in_use').length || 0,
  };

  if (hasError) {
    return (
      <>
        <Stack gap={6} className="items-center justify-center py-20">
          <Card className="max-w-md p-8 text-center">
            <Stack gap={4}>
              <H2>Error Loading Dashboard</H2>
              <Body className="text-grey-400">
                {crewError instanceof Error ? crewError.message : 
                 equipmentError instanceof Error ? equipmentError.message : 
                 'Failed to load dashboard data'}
              </Body>
              <Button variant="solid" onClick={handleRetry}>
                Retry
              </Button>
            </Stack>
          </Card>
        </Stack>
      </>
    );
  }

  return (
    <>
      <EnterprisePageHeader
        title="Production Operations"
        subtitle={`Welcome back, ${user.name}`}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={8}>
            {/* Production Manager View */}
            <H2 className="mb-6">PRODUCTION OVERVIEW</H2>
        {isLoading ? (
          <Stack className="flex justify-center py-12">
            <Spinner variant="grey" size="lg" text="Loading production data..." />
          </Stack>
        ) : (
          <>
            <Grid cols={4} gap={6} className="mb-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard value="18" label="Active Productions" aria-label="Active Productions: 18" />
              <StatCard value={stats.totalCrew.toString()} label="Crew Members" aria-label={`Crew Members: ${stats.totalCrew}`} />
              <StatCard value={stats.inUseEquipment.toString()} label="Equipment In Use" aria-label={`Equipment In Use: ${stats.inUseEquipment}`} />
              <StatCard value="92%" label="On-Time Rate" aria-label="On-Time Rate: 92%" />
            </Grid>

            {/* Quick Actions */}
            <Grid cols={3} gap={6} className="mb-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6" role="region" aria-label="Project Management Actions">
                <H3 className="mb-4">PROJECT MANAGEMENT</H3>
                <Stack gap={3}>
                  <Button
                    variant="solid"
                    className="w-full"
                    onClick={() => router.push('/projects/new')}
                  >
                    Create Project
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/projects')}
                  >
                    View All Projects
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/timeline')}
                  >
                    Production Timeline
                  </Button>
                </Stack>
              </Card>

              <Card className="p-6" role="region" aria-label="Crew Management Actions">
                <H3 className="mb-4">CREW MANAGEMENT</H3>
                <Stack gap={3}>
                  <Button
                    variant="solid"
                    className="w-full"
                    onClick={() => router.push('/crew/assign')}
                  >
                    Assign Crew
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/crew')}
                  >
                    Crew Directory
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/crew/availability')}
                  >
                    Check Availability
                  </Button>
                </Stack>
              </Card>

              <Card className="p-6" role="region" aria-label="Equipment Actions">
                <H3 className="mb-4">EQUIPMENT</H3>
                <Stack gap={3}>
                  <Button
                    variant="solid"
                    className="w-full"
                    onClick={() => router.push('/equipment')}
                  >
                    Equipment Inventory
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/maintenance')}
                  >
                    Maintenance Schedule
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/equipment/checkout')}
                  >
                    Check Out Equipment
                  </Button>
                </Stack>
              </Card>
            </Grid>

            {/* Active Projects */}
            <H2 className="mb-6">ACTIVE PROJECTS</H2>
            <Stack gap={4} className="mb-8">
              <Card className="border-l-4 border-black p-6">
                <Stack gap={4} direction="horizontal" className="items-start justify-between">
                  <Stack gap={2}>
                    <Body className="font-display text-body-md">Summer Music Festival 2024</Body>
                    <Body size="sm" className="">
                      Load-in: June 12 • Event: June 15-17 • Load-out: June 18
                    </Body>
                    <Stack gap={2} direction="horizontal">
                      <StatusBadge status="success" size="sm">
                        ON TRACK
                      </StatusBadge>
                      <Badge variant="solid" size="sm">
                        32 CREW
                      </Badge>
                    </Stack>
                  </Stack>
                  <Button variant="outline" size="sm" onClick={() => router.push('/projects/summer-festival-2024')}>View Details</Button>
                </Stack>
              </Card>

              <Card className="border-l-4 border-ink-700 p-6">
                <Stack gap={4} direction="horizontal" className="items-start justify-between">
                  <Stack gap={2}>
                    <Body className="font-display text-body-md">Corporate Product Launch</Body>
                    <Body size="sm" className="">
                      Setup: June 10 • Event: June 11 • Strike: June 12
                    </Body>
                    <Stack gap={2} direction="horizontal">
                      <StatusBadge status="warning" size="sm">
                        ATTENTION
                      </StatusBadge>
                      <Badge variant="solid" size="sm">
                        18 CREW
                      </Badge>
                    </Stack>
                  </Stack>
                  <Button variant="outline" size="sm" onClick={() => router.push('/projects/corporate-launch')}>View Details</Button>
                </Stack>
              </Card>

              <Card className="border-l-4 border-ink-400 p-6">
                <Stack gap={4} direction="horizontal" className="items-start justify-between">
                  <Stack gap={2}>
                    <Body className="font-display text-body-md">Theater Production: Hamilton</Body>
                    <Body size="sm" className="">
                      Tech Week: June 8-13 • Opening: June 14 • Run: Through July
                    </Body>
                    <Stack gap={2} direction="horizontal">
                      <StatusBadge status="info" size="sm">
                        TECH WEEK
                      </StatusBadge>
                      <Badge variant="solid" size="sm">
                        24 CREW
                      </Badge>
                    </Stack>
                  </Stack>
                  <Button variant="outline" size="sm" onClick={() => router.push('/projects/hamilton')}>View Details</Button>
                </Stack>
              </Card>
            </Stack>

            {/* Crew Status */}
            <Grid cols={2} gap={6} className="mb-8 grid-cols-1 lg:grid-cols-2">
              <Card className="p-6" role="region" aria-label="Crew Status Summary">
                <H3 className="mb-4">CREW STATUS TODAY</H3>
                <Stack gap={3}>
                  <Stack gap={2} direction="horizontal" className="justify-between border-b pb-2">
                    <Body>Total Crew</Body>
                    <Body className="font-display">{stats.totalCrew} crew</Body>
                  </Stack>
                  <Stack gap={2} direction="horizontal" className="justify-between border-b pb-2">
                    <Body>Available</Body>
                    <Body className="font-display">{stats.activeCrew} crew</Body>
                  </Stack>
                  <Stack gap={2} direction="horizontal" className="justify-between border-b pb-2">
                    <Body>Equipment Available</Body>
                    <Body className="font-display">{stats.availableEquipment} items</Body>
                  </Stack>
                  <Stack gap={2} direction="horizontal" className="justify-between">
                    <Body>Equipment In Use</Body>
                    <Body className="font-display">{stats.inUseEquipment} items</Body>
                  </Stack>
                </Stack>
              </Card>

              <Card className="p-6" role="region" aria-label="Recent Activity Feed">
                <H3 className="mb-4">RECENT ACTIVITY</H3>
                <Stack gap={2} role="feed" aria-label="Activity updates">
                  {recentActivity.map((activity) => (
                    <Body key={activity.id} size="sm" className="" role="article" aria-label={`${activity.action}: ${activity.detail}`}>
                      {activity.action}: {activity.detail}
                    </Body>
                  ))}
                </Stack>
              </Card>
            </Grid>
          </>
        )}
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
