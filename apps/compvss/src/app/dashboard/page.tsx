'use client';

import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../components/navigation';
import { useCrew } from '../../hooks/useCrew';
import { useEquipment } from '../../hooks/useEquipment';
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
  StatusBadge,
  Badge,
  LoadingSpinner,
} from '@ghxstship/ui';

/**
 * COMPVSS Production Operations Dashboard
 * Role-based views for production team members
 */
export default function CompvssDashboardPage() {
  const router = useRouter();
  const { data: crew, isLoading: crewLoading } = useCrew();
  const { data: equipment, isLoading: equipmentLoading } = useEquipment();

  // Mock user - in production this would come from auth context
  const user = {
    name: 'Production Manager',
    role: 'COMPVSS_ADMIN',
  };

  const isLoading = crewLoading || equipmentLoading;

  // Calculate real stats
  const stats = {
    activeCrew: crew?.filter(c => c.availability === 'available').length || 247,
    totalCrew: crew?.length || 247,
    availableEquipment: equipment?.filter(e => e.status === 'available').length || 0,
    inUseEquipment: equipment?.filter(e => e.status === 'in_use').length || 0,
  };

  return (
    <Section className="min-h-screen bg-white">
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
        {/* Header */}
        <Stack gap={2} className="border-b-2 border-black pb-8">
          <H1>Production Operations</H1>
          <Body className="text-grey-600">Welcome back, {user.name}</Body>
        </Stack>

        {/* Production Manager View */}
        <H2 className="mb-6">PRODUCTION OVERVIEW</H2>
        {isLoading ? (
          <Stack className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading production data..." />
          </Stack>
        ) : (
          <>
            <Grid cols={4} gap={6} className="mb-8">
              <StatCard value="18" label="Active Productions" />
              <StatCard value={stats.totalCrew.toString()} label="Crew Members" />
              <StatCard value={stats.inUseEquipment.toString()} label="Equipment In Use" />
              <StatCard value="92%" label="On-Time Rate" />
            </Grid>

            {/* Quick Actions */}
            <Grid cols={3} gap={6} className="mb-8">
              <Card className="p-6">
                <H2 className="mb-4">PROJECT MANAGEMENT</H2>
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

              <Card className="p-6">
                <H2 className="mb-4">CREW MANAGEMENT</H2>
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

              <Card className="p-6">
                <H2 className="mb-4">EQUIPMENT</H2>
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
              <Card className="p-6 border-l-4 border-black">
                <Stack gap={4} direction="horizontal" className="justify-between items-start">
                  <Stack gap={2}>
                    <Body className="font-bold text-body-md">Summer Music Festival 2024</Body>
                    <Body className="text-body-sm">
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

              <Card className="p-6 border-l-4 border-grey-700">
                <Stack gap={4} direction="horizontal" className="justify-between items-start">
                  <Stack gap={2}>
                    <Body className="font-bold text-body-md">Corporate Product Launch</Body>
                    <Body className="text-body-sm">
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

              <Card className="p-6 border-l-4 border-grey-400">
                <Stack gap={4} direction="horizontal" className="justify-between items-start">
                  <Stack gap={2}>
                    <Body className="font-bold text-body-md">Theater Production: Hamilton</Body>
                    <Body className="text-body-sm">
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
            <Grid cols={2} gap={6} className="mb-8">
              <Card className="p-6">
                <H2 className="mb-4">CREW STATUS TODAY</H2>
                <Stack gap={3}>
                  <Stack gap={2} direction="horizontal" className="justify-between border-b pb-2">
                    <Body>Total Crew</Body>
                    <Body className="font-bold">{stats.totalCrew} crew</Body>
                  </Stack>
                  <Stack gap={2} direction="horizontal" className="justify-between border-b pb-2">
                    <Body>Available</Body>
                    <Body className="font-bold">{stats.activeCrew} crew</Body>
                  </Stack>
                  <Stack gap={2} direction="horizontal" className="justify-between border-b pb-2">
                    <Body>Equipment Available</Body>
                    <Body className="font-bold">{stats.availableEquipment} items</Body>
                  </Stack>
                  <Stack gap={2} direction="horizontal" className="justify-between">
                    <Body>Equipment In Use</Body>
                    <Body className="font-bold">{stats.inUseEquipment} items</Body>
                  </Stack>
                </Stack>
              </Card>

              <Card className="p-6">
                <H2 className="mb-4">RECENT ACTIVITY</H2>
                <Stack gap={2} className="text-body-sm">
                  <Body className="text-body-sm">• Check-in: Mike Johnson - Lighting Tech</Body>
                  <Body className="text-body-sm">• Project created: Fall Concert Series</Body>
                  <Body className="text-body-sm">• Crew assigned: Summer Festival (8 new)</Body>
                  <Body className="text-body-sm">• Equipment checked out: Sound Package A</Body>
                  <Body className="text-body-sm">• Show report submitted: Corporate Event #1247</Body>
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
