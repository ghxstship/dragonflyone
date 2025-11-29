"use client";

import { useRouter } from "next/navigation";
import { GvtewayAppLayout, GvtewayLoadingLayout } from "@/components/app-layout";
import {
  H2,
  H3,
  Body,
  Button,
  Badge,
  Card,
  EmptyState,
  Stack,
  Grid,
  Kicker,
  Label,
} from "@ghxstship/ui";
import { useTickets } from "@/hooks/useTickets";
import { Ticket, QrCode, Send, Calendar, MapPin, Hash } from "lucide-react";

export default function TicketsPage() {
  const router = useRouter();
  const { data: tickets, isLoading } = useTickets();

  if (isLoading) {
    return <GvtewayLoadingLayout text="Loading tickets..." variant="consumer-auth" />;
  }

  return (
    <GvtewayAppLayout variant="consumer-auth">
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Your Events</Kicker>
              <H2 size="lg" className="text-white">My Tickets</H2>
              <Body className="text-on-dark-muted">View and manage your event tickets</Body>
            </Stack>

            {tickets && tickets.length > 0 ? (
              <Stack gap={6}>
                {tickets.map((ticket) => (
                  <Card key={ticket.id} inverted interactive>
                    <Stack gap={4}>
                      <Stack gap={2} direction="horizontal" className="items-start justify-between">
                        <Stack gap={3}>
                          <Stack gap={1}>
                            <Stack direction="horizontal" gap={2} className="items-center">
                              <Ticket className="size-5 text-on-dark-muted" />
                              <H3 className="text-white">{ticket.event?.name || 'Event'}</H3>
                            </Stack>
                            <Body className="text-on-dark-muted">{ticket.event?.venue || 'Venue'}</Body>
                          </Stack>
                          <Grid cols={2} gap={4}>
                            <Stack gap={1}>
                              <Stack direction="horizontal" gap={1} className="items-center">
                                <Calendar className="size-3 text-on-dark-disabled" />
                                <Label size="xs" className="text-on-dark-disabled">Date</Label>
                              </Stack>
                              <Body size="sm" className="text-white">
                                {ticket.event?.start_date ? new Date(ticket.event.start_date).toLocaleDateString() : 'TBD'}
                              </Body>
                            </Stack>
                            <Stack gap={1}>
                              <Stack direction="horizontal" gap={1} className="items-center">
                                <MapPin className="size-3 text-on-dark-disabled" />
                                <Label size="xs" className="text-on-dark-disabled">Section</Label>
                              </Stack>
                              <Body size="sm" className="text-white">{ticket.ticket_type?.name || 'General'}</Body>
                            </Stack>
                            <Stack gap={1}>
                              <Label size="xs" className="text-on-dark-disabled">Seat</Label>
                              <Body size="sm" className="text-white">{ticket.seat_number || 'General Admission'}</Body>
                            </Stack>
                            <Stack gap={1}>
                              <Stack direction="horizontal" gap={1} className="items-center">
                                <Hash className="size-3 text-on-dark-disabled" />
                                <Label size="xs" className="text-on-dark-disabled">Ticket ID</Label>
                              </Stack>
                              <Body size="sm" className="font-mono text-white">{ticket.id.substring(0, 12).toUpperCase()}</Body>
                            </Stack>
                          </Grid>
                        </Stack>
                        <Stack gap={3} className="items-end">
                          <Badge variant="solid">{ticket.status.toUpperCase()}</Badge>
                          <Card inverted className="flex size-20 items-center justify-center border-2 border-white bg-white p-2">
                            <QrCode className="size-12 text-black" />
                          </Card>
                        </Stack>
                      </Stack>
                      <Stack gap={3} direction="horizontal">
                        <Button 
                          variant="solid" 
                          size="sm" 
                          inverted
                          onClick={() => router.push(`/tickets/${ticket.id}/qr`)}
                          icon={<QrCode className="size-4" />}
                          iconPosition="left"
                        >
                          View QR Code
                        </Button>
                        <Button 
                          variant="outlineInk" 
                          size="sm" 
                          onClick={() => router.push(`/tickets/${ticket.id}/transfer`)}
                          icon={<Send className="size-4" />}
                          iconPosition="left"
                        >
                          Transfer
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            ) : (
              <EmptyState
                title="No Tickets Found"
                description="You don't have any tickets yet"
                action={{ label: "Browse Events", onClick: () => router.push('/events') }}
                inverted
              />
            )}
          </Stack>
    </GvtewayAppLayout>
  );
}
