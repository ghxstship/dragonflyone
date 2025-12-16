'use client';

import { useState } from 'react';
import {
  EnterprisePageHeader,
  MainContent,
  Container,
  Card,
  CardBody,
  Stack,
  Button,
  Badge,
  Grid,
  Body,
  H3,
  Spinner,
  EmptyState,
} from '@ghxstship/ui';
import {
  Calendar,
  MapPin,
  Download,
  Send,
  QrCode,
  Ticket,
} from 'lucide-react';
import { GvtewayAppLayout } from '../../../components/app-layout';
import { useTickets } from '@/hooks/useTickets';
import { useRouter } from 'next/navigation';

export default function AccountTicketsPage() {
  const router = useRouter();
  const { data: ticketsData, isLoading, error } = useTickets();
  const [filter, setFilter] = useState<'all' | 'active' | 'past'>('all');

  // Transform tickets to expected format
  const tickets = (ticketsData || []).map(ticket => ({
    id: ticket.id,
    eventName: ticket.event?.title || ticket.event?.name || 'Event',
    eventDate: ticket.event?.event_date || ticket.event?.start_date 
      ? new Date(ticket.event?.event_date || ticket.event?.start_date || '').toLocaleDateString()
      : 'TBD',
    venue: ticket.event?.venue || 'Venue TBD',
    ticketType: ticket.ticket_type?.name || 'General Admission',
    status: ticket.status === 'sold' ? 'active' : ticket.status,
    section: null,
    row: null,
    seat: ticket.seat_number,
  }));

  const filteredTickets = tickets.filter(t => {
    if (filter === 'active') return t.status === 'active' || t.status === 'reserved';
    if (filter === 'past') return t.status === 'cancelled';
    return true;
  });

  if (isLoading) {
    return (
      <GvtewayAppLayout>
        <EnterprisePageHeader title="My Tickets" subtitle="View and manage your event tickets" showFavorite showSettings />
        <MainContent padding="lg"><Container>
          <Stack className="flex items-center justify-center py-20">
            <Spinner variant="grey" size="lg" text="Loading tickets..." />
          </Stack>
        </Container></MainContent>
      </GvtewayAppLayout>
    );
  }

  if (error) {
    return (
      <GvtewayAppLayout>
        <EnterprisePageHeader title="My Tickets" subtitle="View and manage your event tickets" showFavorite showSettings />
        <MainContent padding="lg"><Container>
          <EmptyState
            icon={<Ticket size={48} />}
            title="Unable to load tickets"
            description="There was a problem loading your tickets. Please try again."
            inverted
          />
        </Container></MainContent>
      </GvtewayAppLayout>
    );
  }

  if (tickets.length === 0) {
    return (
      <GvtewayAppLayout>
        <EnterprisePageHeader title="My Tickets" subtitle="View and manage your event tickets" showFavorite showSettings />
        <MainContent padding="lg"><Container>
          <EmptyState
            icon={<Ticket size={48} />}
            title="No tickets yet"
            description="You don't have any tickets yet. Browse events to find your next experience!"
            action={{ label: "Browse Events", onClick: () => router.push('/browse') }}
            inverted
          />
        </Container></MainContent>
      </GvtewayAppLayout>
    );
  }

  return (
    <GvtewayAppLayout>
      <EnterprisePageHeader title="My Tickets" subtitle="View and manage your event tickets" showFavorite showSettings />
      <MainContent padding="lg"><Container>
        <Stack gap={8}>
          <Stack direction="horizontal" gap={2}>
          <Button variant={filter === 'all' ? 'solid' : 'outline'} onClick={() => setFilter('all')}>All</Button>
          <Button variant={filter === 'active' ? 'solid' : 'outline'} onClick={() => setFilter('active')}>Upcoming</Button>
          <Button variant={filter === 'past' ? 'solid' : 'outline'} onClick={() => setFilter('past')}>Past</Button>
        </Stack>

        <Grid cols={2} gap={6}>
          {filteredTickets.map(ticket => (
            <Card key={ticket.id} variant="elevated" inverted>
              <CardBody>
                <Stack gap={4}>
                  <Stack direction="horizontal" className="items-start justify-between">
                    <Stack gap={1}>
                      <H3 className="text-white">{ticket.eventName}</H3>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Calendar size={14} className="text-on-dark-muted" />
                        <Body size="sm" className="text-on-dark-muted">{ticket.eventDate}</Body>
                      </Stack>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <MapPin size={14} className="text-on-dark-muted" />
                        <Body size="sm" className="text-on-dark-muted">{ticket.venue}</Body>
                      </Stack>
                    </Stack>
                    <Badge variant={ticket.status === 'active' ? 'success' : ticket.status === 'used' ? 'info' : 'warning'}>
                      {ticket.status}
                    </Badge>
                  </Stack>

                  <Stack direction="horizontal" className="justify-between border-t border-ink-700 pt-3">
                    <Stack gap={0}>
                      <Body size="sm" className="text-on-dark-muted">Ticket Type</Body>
                      <Body className="font-weight-semibold text-white">{ticket.ticketType}</Body>
                    </Stack>
                    {ticket.section && (
                      <Stack gap={0}>
                        <Body size="sm" className="text-on-dark-muted">Section</Body>
                        <Body className="text-white">{ticket.section}</Body>
                      </Stack>
                    )}
                    {ticket.row && (
                      <Stack gap={0}>
                        <Body size="sm" className="text-on-dark-muted">Row</Body>
                        <Body className="text-white">{ticket.row}</Body>
                      </Stack>
                    )}
                    {ticket.seat && (
                      <Stack gap={0}>
                        <Body size="sm" className="text-on-dark-muted">Seat</Body>
                        <Body className="text-white">{ticket.seat}</Body>
                      </Stack>
                    )}
                  </Stack>

                  {ticket.status === 'active' && (
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="solid" size="sm"><QrCode size={14} className="mr-1" />View QR</Button>
                      <Button variant="outline" size="sm"><Download size={14} className="mr-1" />Download</Button>
                      <Button variant="outline" size="sm"><Send size={14} className="mr-1" />Transfer</Button>
                    </Stack>
                  )}
                </Stack>
              </CardBody>
            </Card>
          ))}
          </Grid>
        </Stack>
      </Container></MainContent>
    </GvtewayAppLayout>
  );
}
