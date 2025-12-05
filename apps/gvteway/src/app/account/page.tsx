'use client';

import { useState } from 'react';
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
  Ticket,
  Calendar,
  Heart,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { GvtewayAppLayout } from '../../components/app-layout';
import Link from 'next/link';

interface UpcomingEvent {
  id: string;
  name: string;
  date: string;
  venue: string;
  ticketCount: number;
}

const MOCK_UPCOMING: UpcomingEvent[] = [
  { id: 'E-001', name: 'Summer Music Festival 2024', date: 'Nov 20, 2024', venue: 'Outdoor Amphitheater', ticketCount: 2 },
  { id: 'E-002', name: 'New Years Eve Concert', date: 'Dec 31, 2024', venue: 'City Arena', ticketCount: 4 },
];

export default function AccountPage() {
  const [upcomingEvents] = useState(MOCK_UPCOMING);

  return (
    <GvtewayAppLayout>
      <Stack gap={8}>
        <SectionHeader kicker="My Account" title="Dashboard" description="Manage your tickets, orders, and preferences" colorScheme="on-dark" />

        <Grid cols={4} gap={4}>
          <StatCard label="Upcoming Events" value={upcomingEvents.length.toString()} icon={<Calendar size={20} />} inverted />
          <StatCard label="Total Tickets" value={upcomingEvents.reduce((sum, e) => sum + e.ticketCount, 0).toString()} icon={<Ticket size={20} />} inverted />
          <StatCard label="Saved Events" value="5" icon={<Heart size={20} />} inverted />
          <StatCard label="Rewards Points" value="1,250" icon={<Settings size={20} />} inverted />
        </Grid>

        <Grid cols={2} gap={6}>
          <Card variant="elevated" inverted>
            <CardBody>
              <Stack gap={4}>
                <Stack direction="horizontal" className="items-center justify-between">
                  <H3 className="text-white">Upcoming Events</H3>
                  <Link href="/account/tickets">
                    <Button variant="ghost" size="sm">View All<ChevronRight size={14} className="ml-1" /></Button>
                  </Link>
                </Stack>
                <Stack gap={3}>
                  {upcomingEvents.map(event => (
                    <Stack key={event.id} direction="horizontal" className="items-center justify-between rounded border-2 border-ink-700 p-4">
                      <Stack gap={1}>
                        <Body className="font-weight-semibold text-white">{event.name}</Body>
                        <Body className="text-body-sm text-on-dark-muted">{event.date} - {event.venue}</Body>
                      </Stack>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Badge variant="info">{event.ticketCount} tickets</Badge>
                        <Button variant="outline" size="sm">View</Button>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </CardBody>
          </Card>

          <Stack gap={6}>
            <Card variant="elevated" inverted>
              <CardBody>
                <Stack gap={4}>
                  <H3 className="text-white">Quick Actions</H3>
                  <Grid cols={2} gap={3}>
                    <Link href="/account/tickets">
                      <Button variant="outline" className="w-full justify-start">
                        <Ticket size={16} className="mr-2" />My Tickets
                      </Button>
                    </Link>
                    <Link href="/account/orders">
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar size={16} className="mr-2" />Order History
                      </Button>
                    </Link>
                    <Link href="/account/profile">
                      <Button variant="outline" className="w-full justify-start">
                        <Settings size={16} className="mr-2" />Settings
                      </Button>
                    </Link>
                    <Link href="/saved">
                      <Button variant="outline" className="w-full justify-start">
                        <Heart size={16} className="mr-2" />Saved Events
                      </Button>
                    </Link>
                  </Grid>
                </Stack>
              </CardBody>
            </Card>

            <Card variant="elevated" inverted>
              <CardBody>
                <Stack gap={4}>
                  <H3 className="text-white">Recent Activity</H3>
                  <Stack gap={2}>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Body className="text-white">Purchased 2 tickets</Body>
                      <Body className="text-body-sm text-on-dark-muted">2 days ago</Body>
                    </Stack>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Body className="text-white">Saved New Years Eve Concert</Body>
                      <Body className="text-body-sm text-on-dark-muted">5 days ago</Body>
                    </Stack>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Body className="text-white">Updated payment method</Body>
                      <Body className="text-body-sm text-on-dark-muted">1 week ago</Body>
                    </Stack>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          </Stack>
        </Grid>
      </Stack>
    </GvtewayAppLayout>
  );
}
