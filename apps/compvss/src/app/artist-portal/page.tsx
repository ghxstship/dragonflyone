'use client';

import {
  SectionHeader,
  Card,
  CardBody,
  Stack,
  StatCard,
  Button,
  Badge,
  Grid,
  Body,
  H3,
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
import { CompvssAppLayout } from '../../components/app-layout';

import {
  DEMO_ARTIST_DATA,
  DEMO_UPCOMING_SHOWS,
  DEMO_RIDER_STATUS,
} from '../../lib/demo-data';

const upcomingShows = DEMO_UPCOMING_SHOWS;
const riderStatus = DEMO_RIDER_STATUS;

export default function ArtistPortalPage() {
  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="Artist Portal"
          title={`Welcome, ${DEMO_ARTIST_DATA.artistName}`}
          description="Manage your bookings, riders, and hospitality requests"
          colorScheme="on-dark"
        />

        <Grid cols={4} gap={4}>
          <StatCard
            label="Upcoming Shows"
            value={DEMO_ARTIST_DATA.upcomingShows.toString()}
            icon={<Music size={20} />}
            inverted
          />
          <StatCard
            label="Confirmed Bookings"
            value={DEMO_ARTIST_DATA.confirmedBookings.toString()}
            icon={<CheckCircle size={20} />}
            inverted
          />
          <StatCard
            label="Pending Riders"
            value={DEMO_ARTIST_DATA.pendingRiders.toString()}
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

        <Grid cols={2} gap={6}>
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
                          <Body className="text-body-sm text-on-dark-muted">{show.venue}</Body>
                          <Body className="text-body-sm text-on-dark-muted">
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
                        <Body className="text-body-sm text-on-dark-muted">
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
              <Grid cols={4} gap={4}>
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
    </CompvssAppLayout>
  );
}
