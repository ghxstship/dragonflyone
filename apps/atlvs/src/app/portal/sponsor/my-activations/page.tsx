'use client';

import { useState } from 'react';
import {
  Badge,
  Body,
  Button,
  Card,
  CardBody,
  Grid,
  H3,
  SectionHeader,
  Stack,
  StatCard,
  Skeleton,
} from '@ghxstship/ui';
import { Calendar, MapPin, Users, Clock, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { AtlvsAppLayout } from '../../../../components/app-layout';
import { useSponsorActivations, type SponsorActivation } from '@ghxstship/config';

interface DisplayActivation {
  id: string;
  name: string;
  event: string;
  location: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  type: string;
  staffAssigned: number;
  staffRequired: number;
  impressions: number;
  engagements: number;
}

const DEMO_ACTIVATIONS: DisplayActivation[] = [
  {
    id: '1',
    name: 'Main Stage Brand Activation',
    event: 'Summer Music Festival 2025',
    location: 'Main Stage Area',
    startDate: '2025-06-15',
    endDate: '2025-06-17',
    status: 'upcoming',
    type: 'Experiential',
    staffAssigned: 8,
    staffRequired: 10,
    impressions: 0,
    engagements: 0,
  },
  {
    id: '2',
    name: 'VIP Lounge Sponsorship',
    event: 'Tech Conference 2025',
    location: 'VIP Area - Hall B',
    startDate: '2025-05-20',
    endDate: '2025-05-22',
    status: 'upcoming',
    type: 'Hospitality',
    staffAssigned: 4,
    staffRequired: 4,
    impressions: 0,
    engagements: 0,
  },
];

const statusVariants: Record<string, 'info' | 'success' | 'warning' | 'error'> = {
  upcoming: 'info',
  active: 'success',
  completed: 'success',
  cancelled: 'error',
};

export default function MyActivationsPage() {
  const { activations: apiActivations, summary, isLoading, error, refetch } = useSponsorActivations();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Map API activations to display format or fall back to demo data
  const activations: DisplayActivation[] = apiActivations.length > 0
    ? apiActivations.map((a: SponsorActivation) => ({
        id: a.id,
        name: a.name,
        event: a.event,
        location: a.location,
        startDate: a.start_date,
        endDate: a.end_date,
        status: a.status,
        type: a.type,
        staffAssigned: a.staff_assigned,
        staffRequired: a.staff_required,
        impressions: a.impressions,
        engagements: a.engagements,
      }))
    : DEMO_ACTIVATIONS;

  const filteredActivations = activations.filter((activation) => {
    return statusFilter === 'all' || activation.status === statusFilter;
  });

  const upcomingCount = summary?.upcoming || activations.filter((a) => a.status === 'upcoming').length;
  const activeCount = summary?.active || activations.filter((a) => a.status === 'active').length;
  const completedCount = summary?.completed || activations.filter((a) => a.status === 'completed').length;

  if (isLoading) {
    return (
      <AtlvsAppLayout>
        <Stack gap={8}>
          <SectionHeader kicker="Sponsor Portal" title="My Activations" description="View and manage your sponsored activations across all events" colorScheme="on-dark" />
          <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} inverted className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-24" />
              </Card>
            ))}
          </Grid>
        </Stack>
      </AtlvsAppLayout>
    );
  }

  if (error) {
    return (
      <AtlvsAppLayout>
        <Stack gap={8}>
          <SectionHeader kicker="Sponsor Portal" title="My Activations" description="View and manage your sponsored activations across all events" colorScheme="on-dark" />
          <Card inverted className="p-8 text-center">
            <Stack gap={4} className="items-center">
              <AlertCircle size={48} className="text-error" />
              <H3 className="text-white">Failed to Load Activations</H3>
              <Body className="text-grey-300">{error.message}</Body>
              <Button variant="solid" onClick={() => refetch()}>
                Try Again
              </Button>
            </Stack>
          </Card>
        </Stack>
      </AtlvsAppLayout>
    );
  }

  return (
    <AtlvsAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="Sponsor Portal"
          title="My Activations"
          description="View and manage your sponsored activations across all events"
          colorScheme="on-dark"
        />

        <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Upcoming" value={upcomingCount.toString()} icon={<Clock size={20} />} inverted />
          <StatCard label="Active" value={activeCount.toString()} icon={<Calendar size={20} />} inverted />
          <StatCard label="Completed" value={completedCount.toString()} icon={<Users size={20} />} inverted />
        </Grid>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <H3 className="text-white">All Activations</H3>
                <Stack direction="horizontal" gap={2}>
                  <Button
                    variant={statusFilter === 'all' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === 'upcoming' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('upcoming')}
                  >
                    Upcoming
                  </Button>
                  <Button
                    variant={statusFilter === 'active' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('active')}
                  >
                    Active
                  </Button>
                  <Button
                    variant={statusFilter === 'completed' ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('completed')}
                  >
                    Completed
                  </Button>
                </Stack>
              </Stack>

              <Stack gap={3}>
                {filteredActivations.map((activation) => (
                  <Stack key={activation.id} className="rounded border-2 border-ink-700 p-4">
                    <Stack direction="horizontal" className="items-start justify-between">
                      <Stack gap={1}>
                        <Body className="font-weight-semibold text-white">{activation.name}</Body>
                        <Body size="sm" className=" text-on-dark-muted">{activation.event}</Body>
                      </Stack>
                      <Badge variant={statusVariants[activation.status]}>
                        {activation.status.charAt(0).toUpperCase() + activation.status.slice(1)}
                      </Badge>
                    </Stack>
                    <Stack direction="horizontal" className="mt-3 justify-between border-t border-ink-700 pt-3">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <MapPin size={14} className="text-grey-400" />
                        <Body className="text-on-dark-muted">{activation.location}</Body>
                      </Stack>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Calendar size={14} className="text-grey-400" />
                        <Body className="text-on-dark-muted">
                          {new Date(activation.startDate).toLocaleDateString()} - {new Date(activation.endDate).toLocaleDateString()}
                        </Body>
                      </Stack>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Users size={14} className="text-grey-400" />
                        <Body className="text-on-dark-muted">
                          {activation.staffAssigned}/{activation.staffRequired} Staff
                        </Body>
                      </Stack>
                      <Link href={`/portal/sponsor/activations/${activation.id}`}>
                        <Button variant="ghost" size="sm">
                          <ChevronRight size={16} />
                        </Button>
                      </Link>
                    </Stack>
                  </Stack>
                ))}
                {filteredActivations.length === 0 && (
                  <Body className="text-center text-on-dark-muted py-8">No activations found</Body>
                )}
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </AtlvsAppLayout>
  );
}
