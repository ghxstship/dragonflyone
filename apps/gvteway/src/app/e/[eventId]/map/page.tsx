"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, H3 } from "@ghxstship/ui";
import { Map, MapPin, Navigation, Layers } from "lucide-react";
import { gvtewayDemoEvents } from "../../../../data/gvteway";

export default function EventMapPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const event = gvtewayDemoEvents.find((e) => e.id === eventId);

  if (!event) {
    return <Stack gap={4}><SectionHeader kicker="Map" title="Event Not Found" colorScheme="on-dark" /></Stack>;
  }

  return (
    <Stack gap={8}>
      <SectionHeader kicker={event.name} title="Venue Map" description="Interactive venue map and points of interest" colorScheme="on-dark" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card variant="elevated" inverted>
          <CardBody className="text-center">
            <Stack gap={2} className="items-center">
              <Map size={24} className="text-primary" />
              <Body className="font-weight-bold text-white">Full Map</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted>
          <CardBody className="text-center">
            <Stack gap={2} className="items-center">
              <MapPin size={24} className="text-secondary" />
              <Body className="font-weight-bold text-white">Points of Interest</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted>
          <CardBody className="text-center">
            <Stack gap={2} className="items-center">
              <Navigation size={24} className="text-accent" />
              <Body className="font-weight-bold text-white">Navigate</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted>
          <CardBody className="text-center">
            <Stack gap={2} className="items-center">
              <Layers size={24} className="text-warning" />
              <Body className="font-weight-bold text-white">Layers</Body>
            </Stack>
          </CardBody>
        </Card>
      </div>
      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            <H3 className="text-white">Interactive Map</H3>
            <div className="flex h-96 items-center justify-center rounded border-2 border-ink-700 bg-ink-800">
              <Body className="text-on-dark-muted">Interactive venue map will be displayed here</Body>
            </div>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
