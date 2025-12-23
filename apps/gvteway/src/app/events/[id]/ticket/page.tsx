'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { GvtewayLoadingLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
  Button,
  Card,
  Grid,
  Stack,
  Badge,
  Alert,
  Kicker,
} from '@ghxstship/ui';
import { Ticket, QrCode, Download, Share2, Calendar, MapPin, Clock } from 'lucide-react';
interface SeatInfo {
  section: string;
  row: string;
  seat: string;
  gate?: string;
}

interface EventTicket {
  id: string;
  event_id: string;
  order_id: string;
  ticket_type: string;
  holder_name: string;
  holder_email: string;
  status: 'valid' | 'used' | 'cancelled' | 'transferred';
  confirmation_code: string;
  seat_info?: SeatInfo;
  qr_code?: string;
  created_at: string;
}

interface EventInfo {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  image_url?: string;
}

function useEventTickets(eventId: string) {
  const [tickets, setTickets] = useState<EventTicket[]>([]);
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTickets() {
      try {
        const response = await fetch(`/api/events/${eventId}/tickets`);
        if (!response.ok) {
          if (response.status === 401) {
            setTickets([]);
            setIsLoading(false);
            return;
          }
          throw new Error('Failed to fetch tickets');
        }
        const data = await response.json();
        setTickets(data.tickets || []);
        setEvent(data.event || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    fetchTickets();
  }, [eventId]);

  return { tickets, event, isLoading, error };
}

export default function EventTicketPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const { tickets, event, isLoading, error } = useEventTickets(eventId);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  if (isLoading) {
    return <GvtewayLoadingLayout />;
  }

  if (error) {
    return (
      <>
        <Alert variant="error" className="mt-8">
          {error}
        </Alert>
      </>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <>
        <Card inverted className="p-12 text-center mt-12">
          <Ticket className="w-16 h-16 mx-auto mb-4 text-ink-400" />
          <H2 className="mb-4 text-white">NO TICKETS FOUND</H2>
          <Body className="text-on-dark-muted mb-6">
            You don&apos;t have any tickets for this event yet.
          </Body>
          <Button variant="solid" inverted onClick={() => router.push(`/events/${eventId}`)}>
            Get Tickets
          </Button>
        </Card>
      </>
    );
  }

  const activeTicket = selectedTicket 
    ? tickets.find(t => t.id === selectedTicket) 
    : tickets[0];

  return (
    <>
      <Stack gap={10}>
        <Stack gap={2}>
          <Kicker colorScheme="on-dark">My Tickets</Kicker>
          <H2 size="lg" className="text-white">{event?.name || 'Event Tickets'}</H2>
          <Body className="text-on-dark-muted">
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} for this event
          </Body>
        </Stack>

        <Grid cols={3} gap={8} className="sm:grid-cols-2 lg:grid-cols-3">
          <Stack className="col-span-2" gap={6}>
            {activeTicket && (
              <Card className="p-8 border-2 border-black">
                <Stack gap={6}>
                  <Stack direction="horizontal" className="justify-between items-start">
                    <Stack>
                      <Badge variant="success" className="mb-2">
                        {activeTicket.status === 'valid' ? 'VALID' : activeTicket.status.toUpperCase()}
                      </Badge>
                      <H3>{activeTicket.ticket_type}</H3>
                      <Body className="text-ink-600">{activeTicket.holder_name}</Body>
                    </Stack>
                    <Stack className="items-end">
                      <Body className="text-mono-sm text-ink-500">Order #{activeTicket.order_id}</Body>
                      <Body className="text-mono-xs text-ink-400">{activeTicket.confirmation_code}</Body>
                    </Stack>
                  </Stack>

                  <Card className="p-6 bg-ink-50 flex items-center justify-center">
                    <Stack className="items-center" gap={4}>
                      <QrCode className="w-48 h-48 text-black" />
                      <Body className="text-mono-sm text-ink-600">
                        Scan at entry
                      </Body>
                    </Stack>
                  </Card>

                  <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
                    <Stack className="items-center p-4 bg-ink-50 rounded-card">
                      <Calendar className="w-6 h-6 mb-2 text-ink-600" />
                      <Body className="text-mono-xs text-ink-500">DATE</Body>
                      <Body className="font-weight-medium text-center">{event?.date || 'TBD'}</Body>
                    </Stack>
                    <Stack className="items-center p-4 bg-ink-50 rounded-card">
                      <Clock className="w-6 h-6 mb-2 text-ink-600" />
                      <Body className="text-mono-xs text-ink-500">TIME</Body>
                      <Body className="font-weight-medium text-center">{event?.time || 'TBD'}</Body>
                    </Stack>
                    <Stack className="items-center p-4 bg-ink-50 rounded-card">
                      <MapPin className="w-6 h-6 mb-2 text-ink-600" />
                      <Body className="text-mono-xs text-ink-500">VENUE</Body>
                      <Body className="font-weight-medium text-center">{event?.venue || 'TBD'}</Body>
                    </Stack>
                  </Grid>

                  {activeTicket.seat_info && (
                    <Card className="p-4 bg-primary-50 border-2 border-primary-500">
                      <Stack direction="horizontal" className="justify-between">
                        <Stack>
                          <Body className="text-mono-xs text-primary-600">SEAT ASSIGNMENT</Body>
                          <Body className="font-weight-bold text-primary-900">
                            {activeTicket.seat_info.section} - Row {activeTicket.seat_info.row}, Seat {activeTicket.seat_info.seat}
                          </Body>
                        </Stack>
                        {activeTicket.seat_info.gate && (
                          <Stack className="items-end">
                            <Body className="text-mono-xs text-primary-600">ENTRY GATE</Body>
                            <Body className="font-weight-bold text-primary-900">{activeTicket.seat_info.gate}</Body>
                          </Stack>
                        )}
                      </Stack>
                    </Card>
                  )}

                  <Stack direction="horizontal" gap={4}>
                    <Button variant="solid" className="flex-1" onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `Ticket for ${event?.name}`,
                          text: `My ticket for ${event?.name}`,
                          url: window.location.href,
                        });
                      }
                    }}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            )}
          </Stack>

          <Stack gap={6}>
            <Card className="p-6">
              <H3 className="mb-4">ALL TICKETS</H3>
              <Stack gap={3}>
                {tickets.map(ticket => (
                  <Button
                    key={ticket.id}
                    variant={selectedTicket === ticket.id || (!selectedTicket && ticket.id === tickets[0].id) ? 'solid' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setSelectedTicket(ticket.id)}
                  >
                    <Ticket className="w-4 h-4 mr-2" />
                    <Stack className="items-start text-left">
                      <Body className="font-weight-medium">{ticket.ticket_type}</Body>
                      <Body className="text-mono-xs opacity-70">{ticket.holder_name}</Body>
                    </Stack>
                  </Button>
                ))}
              </Stack>
            </Card>

            <Card className="p-6 bg-ink-900 text-white">
              <H3 className="text-white mb-4">NEED HELP?</H3>
              <Body className="text-ink-300 mb-4">
                Having issues with your tickets? Contact our support team.
              </Body>
              <Button
                variant="outline"
                className="w-full border-white text-white hover:bg-white hover:text-black"
                onClick={() => router.push('/help')}
              >
                Get Support
              </Button>
            </Card>
          </Stack>
        </Grid>
      </Stack>
    </>
  );
}
