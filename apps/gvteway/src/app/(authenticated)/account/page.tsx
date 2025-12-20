'use client';

import {
  EnterprisePageHeader,
  MainContent,
  Container,
  Card,
  CardBody,
  Stack,
  StatCard,
  Button,
  Badge,
  Grid,
  Body,
  H3,
  Spinner,
} from '@ghxstship/ui';
import {
  Ticket,
  Calendar,
  Heart,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { GvtewayAppLayout } from '../../../components/app-layout';
import Link from 'next/link';
import { useOrders } from '@/hooks/useOrders';

export default function AccountPage() {
  const { data: ordersData, isLoading } = useOrders();
  
  // Transform orders to upcoming events format
  const upcomingEvents = (ordersData || [])
    .filter(order => order.status === 'confirmed' && order.gvteway_events)
    .map(order => ({
      id: order.id,
      name: order.gvteway_events?.title || 'Event',
      date: order.gvteway_events?.event_date 
        ? new Date(order.gvteway_events.event_date).toLocaleDateString() 
        : 'TBD',
      venue: 'Venue TBD',
      ticketCount: order.ticket_count || 1,
    }))
    .slice(0, 3);

  return (
    <GvtewayAppLayout>
      <EnterprisePageHeader
        title="Dashboard"
        subtitle="Manage your tickets, orders, and preferences"
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={8}>
            <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Upcoming Events" value={upcomingEvents.length.toString()} icon={<Calendar size={20} />} inverted />
          <StatCard label="Total Tickets" value={upcomingEvents.reduce((sum, e) => sum + e.ticketCount, 0).toString()} icon={<Ticket size={20} />} inverted />
          <StatCard label="Saved Events" value="5" icon={<Heart size={20} />} inverted />
          <StatCard label="Rewards Points" value="1,250" icon={<Settings size={20} />} inverted />
        </Grid>

        <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
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
                  {isLoading ? (
                    <Stack className="flex items-center justify-center py-8">
                      <Spinner variant="grey" size="sm" />
                    </Stack>
                  ) : upcomingEvents.length === 0 ? (
                    <Body className="text-on-dark-muted py-4">No upcoming events. Browse events to find your next experience!</Body>
                  ) : (
                    upcomingEvents.map(event => (
                      <Stack key={event.id} direction="horizontal" className="items-center justify-between rounded border-2 border-ink-700 p-4">
                        <Stack gap={1}>
                          <Body className="font-weight-semibold text-white">{event.name}</Body>
                          <Body size="sm" className="text-on-dark-muted">{event.date} - {event.venue}</Body>
                        </Stack>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <Badge variant="info">{event.ticketCount} tickets</Badge>
                          <Button variant="outline" size="sm">View</Button>
                        </Stack>
                      </Stack>
                    ))
                  )}
                </Stack>
              </Stack>
            </CardBody>
          </Card>

          <Stack gap={6}>
            <Card variant="elevated" inverted>
              <CardBody>
                <Stack gap={4}>
                  <H3 className="text-white">Quick Actions</H3>
                  <Grid cols={2} gap={3} className="sm:grid-cols-1 lg:grid-cols-2">
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
                      <Body size="sm" className="text-on-dark-muted">2 days ago</Body>
                    </Stack>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Body className="text-white">Saved New Years Eve Concert</Body>
                      <Body size="sm" className="text-on-dark-muted">5 days ago</Body>
                    </Stack>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Body className="text-white">Updated payment method</Body>
                      <Body size="sm" className="text-on-dark-muted">1 week ago</Body>
                    </Stack>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          </Stack>
            </Grid>
          </Stack>
        </Container>
      </MainContent>
    </GvtewayAppLayout>
  );
}
