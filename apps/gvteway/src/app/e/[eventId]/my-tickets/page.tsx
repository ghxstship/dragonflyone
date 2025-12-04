"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Badge } from "@ghxstship/ui";
import { Ticket, QrCode, Download, Share2 } from "lucide-react";
import { gvtewayDemoEvents } from "../../../../data/gvteway";

export default function MyTicketsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.eventId as string;
  const event = gvtewayDemoEvents.find((e) => e.id === eventId);

  const myTickets = [
    { id: "1", type: "General Admission", quantity: 2, orderNumber: "ORD-12345", status: "confirmed" },
  ];

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
                        <Body className="text-body-sm text-on-dark-muted">
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
                <Body className="text-body-sm text-on-dark-muted">You have not purchased tickets for this event</Body>
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
