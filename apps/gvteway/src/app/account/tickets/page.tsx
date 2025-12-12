'use client';

import { useState } from 'react';
import {
  SectionHeader,
  Card,
  CardBody,
  Stack,
  Button,
  Badge,
  Grid,
  Body,
  H3,
} from '@ghxstship/ui';
import {
  Calendar,
  MapPin,
  Download,
  Send,
  QrCode,
} from 'lucide-react';
import { GvtewayAppLayout } from '../../../components/app-layout';

import { DEMO_USER_TICKETS } from '../../../lib/demo-data';

export default function AccountTicketsPage() {
  const [tickets] = useState(DEMO_USER_TICKETS);
  const [filter, setFilter] = useState<'all' | 'active' | 'past'>('all');

  const filteredTickets = tickets.filter(t => {
    if (filter === 'active') return t.status === 'active';
    if (filter === 'past') return t.status === 'used' || t.status === 'transferred';
    return true;
  });

  return (
    <GvtewayAppLayout>
      <Stack gap={8}>
        <SectionHeader kicker="My Account" title="My Tickets" description="View and manage your event tickets" colorScheme="on-dark" />

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
    </GvtewayAppLayout>
  );
}
