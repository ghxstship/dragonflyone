"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, H3, Button, Box } from "@ghxstship/ui";
import { Ticket, QrCode, Download, Share2 } from "lucide-react";
import { gvtewayDemoEvents } from "../../../../data/gvteway";

export default function EventTicketPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const event = gvtewayDemoEvents.find((e) => e.id === eventId);

  if (!event) {
    return <Stack gap={4}><SectionHeader kicker="Ticket" title="Event Not Found" colorScheme="on-dark" /></Stack>;
  }

  return (
    <Stack gap={8}>
      <SectionHeader kicker={event.name} title="My Ticket" description="Your ticket and entry information" colorScheme="on-dark" />
      
      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={6} className="items-center text-center">
            <Box variant="bordered" className="flex size-48 items-center justify-center rounded bg-ink-800">
              <QrCode size={120} className="text-white" />
            </Box>
            <Stack gap={2} className="items-center">
              <Body className="font-weight-bold text-white">General Admission</Body>
              <Body className="text-on-dark-muted">Ticket #TKT-2024-001234</Body>
            </Stack>
            <Stack direction="horizontal" gap={3}>
              <Button variant="outline" size="sm">
                <Download size={16} className="mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Share2 size={16} className="mr-2" />
                Share
              </Button>
            </Stack>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            <H3 className="text-white">Ticket Details</H3>
            <Stack gap={3}>
              <Stack direction="horizontal" className="justify-between">
                <Body className="text-on-dark-muted">Event</Body>
                <Body className="text-white">{event.name}</Body>
              </Stack>
              <Stack direction="horizontal" className="justify-between">
                <Body className="text-on-dark-muted">Date</Body>
                <Body className="text-white">{event.date}</Body>
              </Stack>
              <Stack direction="horizontal" className="justify-between">
                <Body className="text-on-dark-muted">Venue</Body>
                <Body className="text-white">{event.venue}</Body>
              </Stack>
              <Stack direction="horizontal" className="justify-between">
                <Body className="text-on-dark-muted">Type</Body>
                <Body className="text-white">General Admission</Body>
              </Stack>
            </Stack>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
