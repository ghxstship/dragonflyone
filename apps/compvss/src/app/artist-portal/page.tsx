'use client';

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
} from '@ghxstship/ui';
import {
  Music,
  Calendar,
  FileText,
  Coffee,
  ArrowRight,
  CheckCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
// Layout provided by route group

import {
  useArtistData,
  useUpcomingShows,
  useRiderStatus,
} from '../../hooks/useArtistPortal';

export default function ArtistPortalPage() {
  const { data: artistData, isLoading, error } = useArtistData();
  const { data: upcomingShows = [] } = useUpcomingShows();
  const { data: riderStatus = [] } = useRiderStatus();

  if (isLoading) {
    return (
      <>
        <Stack gap={8} className="flex min-h-[60vh] items-center justify-center">
          <Stack gap={4} className="items-center">
            <div className="h-8 w-8 animate-spin rounded-avatar border-4 border-primary border-t-transparent" />
            <Body>Loading artist data...</Body>
          </Stack>
        </Stack>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack gap={8} className="p-6">
          <Card className="p-6 border-destructive bg-destructive/10">
            <Stack gap={4} className="items-center text-center">
              <Body className="text-destructive font-display">Failed to load artist data</Body>
              <Body className="text-destructive">{error instanceof Error ? error.message : 'An error occurred'}</Body>
              <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
            </Stack>
          </Card>
        </Stack>
      </>
    );
  }

  const displayArtistData = artistData || { artistName: 'Artist', upcomingShows: 0, confirmedBookings: 0, pendingRiders: 0 };

  return (
    <>
      <Stack gap={8}>
        <SectionHeader
          kicker="Artist Portal"
          title={`Welcome, ${displayArtistData.artistName}`}
          description="Manage your bookings, riders, and hospitality requests"
          colorScheme="on-dark"
        />

        <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Upcoming Shows"
            value={displayArtistData.upcomingShows.toString()}
            icon={<Music size={20} />}
            inverted
          />
          <StatCard
            label="Confirmed Bookings"
            value={displayArtistData.confirmedBookings.toString()}
            icon={<CheckCircle size={20} />}
            inverted
          />
          <StatCard
            label="Pending Riders"
            value={displayArtistData.pendingRiders.toString()}
            icon={<FileText size={20} />}
            inverted
          />
          <StatCard
            label="Next Show"
            value="Dec 15"
            icon={<Calendar size={20} />}
            inverted
          />
        </Grid>

        <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
          <Card inverted>
            <CardBody>
              <Stack gap={4}>
                <Stack direction="horizontal" className="items-center justify-between">
                  <H3 className="text-white">Upcoming Shows</H3>
                  <Button variant="ghost" size="sm">
                    View All <ArrowRight size={14} className="ml-1" />
                  </Button>
                </Stack>

                <Stack gap={3}>
                  {upcomingShows.map(show => (
                    <Stack
                      key={show.id}
                      direction="horizontal"
                      className="items-center justify-between border-b border-ink-700 pb-3"
                    >
                      <Stack gap={1}>
                        <Body className="text-white">{show.event}</Body>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <Body size="sm" className=" text-on-dark-muted">{show.venue}</Body>
                          <Body size="sm" className=" text-on-dark-muted">
                            {new Date(show.date).toLocaleDateString()} at {show.time}
                          </Body>
                        </Stack>
                      </Stack>
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Body className="text-on-dark-muted">{show.setLength}</Body>
                        <Badge variant={show.status === 'confirmed' ? 'success' : 'warning'}>
                          {show.status}
                        </Badge>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </CardBody>
          </Card>

          <Card inverted>
            <CardBody>
              <Stack gap={4}>
                <Stack direction="horizontal" className="items-center justify-between">
                  <H3 className="text-white">Rider Status</H3>
                  <Link href="/my-rider">
                    <Button variant="ghost" size="sm">
                      Manage <ArrowRight size={14} className="ml-1" />
                    </Button>
                  </Link>
                </Stack>

                <Stack gap={3}>
                  {riderStatus.map((rider, idx) => (
                    <Stack
                      key={idx}
                      direction="horizontal"
                      className="items-center justify-between border-b border-ink-700 pb-3"
                    >
                      <Stack gap={1}>
                        <Body className="text-white">{rider.category}</Body>
                        <Body size="sm" className=" text-on-dark-muted">
                          Updated: {new Date(rider.lastUpdated).toLocaleDateString()}
                        </Body>
                      </Stack>
                      <Badge variant={rider.status === 'approved' ? 'success' : 'warning'}>
                        {rider.status}
                      </Badge>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </CardBody>
          </Card>
        </Grid>

        <Card inverted>
          <CardBody>
            <Stack gap={4}>
              <H3 className="text-white">Quick Actions</H3>
              <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
                <Link href="/my-rider">
                  <Card className="cursor-pointer transition-colors hover:bg-ink-800">
                    <CardBody>
                      <Stack gap={2} className="items-center py-4">
                        <FileText size={24} className="text-primary" />
                        <Body className="text-white">Update Rider</Body>
                      </Stack>
                    </CardBody>
                  </Card>
                </Link>
                <Link href="/my-hospitality">
                  <Card className="cursor-pointer transition-colors hover:bg-ink-800">
                    <CardBody>
                      <Stack gap={2} className="items-center py-4">
                        <Coffee size={24} className="text-primary" />
                        <Body className="text-white">Hospitality Requests</Body>
                      </Stack>
                    </CardBody>
                  </Card>
                </Link>
                <Card className="cursor-pointer transition-colors hover:bg-ink-800">
                  <CardBody>
                    <Stack gap={2} className="items-center py-4">
                      <Calendar size={24} className="text-primary" />
                      <Body className="text-white">View Schedule</Body>
                    </Stack>
                  </CardBody>
                </Card>
                <Card className="cursor-pointer transition-colors hover:bg-ink-800">
                  <CardBody>
                    <Stack gap={2} className="items-center py-4">
                      <Clock size={24} className="text-primary" />
                      <Body className="text-white">Soundcheck Times</Body>
                    </Stack>
                  </CardBody>
                </Card>
              </Grid>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </>
  );
}
