"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, Box, Grid } from "@ghxstship/ui";
import { DoorOpen, Car, Accessibility, Globe, MapPin, Clock } from "lucide-react";
import { gvtewayDemoEvents } from "../../../../data/gvteway";

export default function EventEntryInfoPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const event = gvtewayDemoEvents.find((e) => e.id === eventId);

  const infoSections = [
    { id: "entry", title: "Entry Points", description: "Main entrance on North Street. VIP entrance on East Side.", icon: DoorOpen },
    { id: "parking", title: "Parking", description: "On-site parking available. $20 per vehicle. Pre-book recommended.", icon: Car },
    { id: "accessibility", title: "Accessibility", description: "Wheelchair accessible. ASL interpreters available on request.", icon: Accessibility },
    { id: "languages", title: "Languages", description: "Event information available in English, Spanish, and French.", icon: Globe },
  ];

  return (
    <Stack gap={8}>
      <SectionHeader
        kicker={event?.name || "Event"}
        title="Entry Information"
        description="Everything you need to know before arriving"
        colorScheme="on-dark"
      />

      <Grid cols={2} gap={4}>
        {infoSections.map((section) => (
          <Card key={section.id} variant="elevated" inverted>
            <CardBody>
              <Stack direction="horizontal" gap={4} className="items-start">
                <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                  <section.icon size={24} className="text-primary" />
                </Box>
                <Stack gap={2} className="flex-1">
                  <Body className="font-weight-bold text-white">{section.title}</Body>
                  <Body size="sm" className=" text-on-dark-muted">{section.description}</Body>
                </Stack>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </Grid>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            <Body className="font-weight-bold text-white">Important Times</Body>
            <Stack gap={3}>
              <Stack direction="horizontal" gap={3} className="items-center">
                <Clock size={16} className="text-on-dark-muted" />
                <Body className="text-on-dark-muted">Doors Open: 14:00</Body>
              </Stack>
              <Stack direction="horizontal" gap={3} className="items-center">
                <Clock size={16} className="text-on-dark-muted" />
                <Body className="text-on-dark-muted">Last Entry: 19:00</Body>
              </Stack>
              <Stack direction="horizontal" gap={3} className="items-center">
                <Clock size={16} className="text-on-dark-muted" />
                <Body className="text-on-dark-muted">Event End: 21:00</Body>
              </Stack>
            </Stack>
          </Stack>
        </CardBody>
      </Card>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            <Body className="font-weight-bold text-white">Venue Location</Body>
            <Stack direction="horizontal" gap={3} className="items-center">
              <MapPin size={16} className="text-primary" />
              <Body className="text-on-dark-muted">{event?.venue || "Venue TBD"}</Body>
            </Stack>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
