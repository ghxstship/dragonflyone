"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Badge, Spinner } from "@ghxstship/ui";
import { Ticket, QrCode, Download, Share2 } from "lucide-react";
import { useEvent } from "@/hooks/useEvents";
import { useTickets } from "@/hooks/useTickets";

export default function MyTicketsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.eventId as string;
  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: ticketsData, isLoading: ticketsLoading } = useTickets();

  if (eventLoading || ticketsLoading) {
    return (
      <Stack gap={4} className="flex items-center justify-center py-20">
        <Spinner variant="grey" size="lg" text="Loading tickets..." />
      </Stack>
    );
  }

  // Filter tickets for this event
  const myTickets = (ticketsData || [])
    .filter(t => t.event_id === eventId)
    .map(t => ({
      id: t.id,
      type: t.ticket_type?.name || "General Admission",
      quantity: 1,
      orderNumber: `ORD-${t.id.slice(0, 8)}`,
      status: t.status === 'sold' ? 'confirmed' : t.status || "confirmed",
    }));

  return (
    <Stack gap={8}>
      <SectionHeader
        kicker={event?.name || "Event"}
        title="My Tickets"
        description="Your tickets for this event"
        colorScheme="on-dark"
      />

      {myTickets.length > 0 ? (
        <Stack gap={4}>
          {myTickets.map((ticket) => (
            <Card key={ticket.id} variant="elevated" inverted>
              <CardBody>
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={4} className="items-center justify-between">
                    <Stack direction="horizontal" gap={4} className="items-center">
                      <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                        <Ticket size={24} className="text-primary" />
                      </Box>
                      <Stack gap={1}>
                        <Body className="font-weight-bold text-white">{ticket.type}</Body>
                        <Body size="sm" className=" text-on-dark-muted">
                          {ticket.quantity} ticket{ticket.quantity > 1 ? "s" : ""} · {ticket.orderNumber}
                        </Body>
                      </Stack>
                    </Stack>
                    <Badge variant="success">{ticket.status.toUpperCase()}</Badge>
                  </Stack>
                  <Stack direction="horizontal" gap={2}>
                    <Button variant="solid" size="sm">
                      <QrCode size={16} className="mr-2" />
                      Show QR Code
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download size={16} className="mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 size={16} className="mr-2" />
                      Transfer
                    </Button>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </Stack>
      ) : (
        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4} className="items-center py-8 text-center">
              <Box className="flex size-16 items-center justify-center rounded bg-ink-800">
                <Ticket size={32} className="text-on-dark-muted" />
              </Box>
              <Stack gap={2}>
                <Body className="font-weight-bold text-white">No Tickets Yet</Body>
                <Body size="sm" className=" text-on-dark-muted">You have not purchased tickets for this event</Body>
              </Stack>
              <Button variant="solid" onClick={() => router.push(`/e/${eventId}/tickets`)}>
                Get Tickets
              </Button>
            </Stack>
          </CardBody>
        </Card>
      )}
    </Stack>
  );
}
