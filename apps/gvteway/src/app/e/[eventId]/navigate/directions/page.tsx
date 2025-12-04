"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, H3 } from "@ghxstship/ui";
import { Navigation, Car, Train, Footprints } from "lucide-react";
import { gvtewayDemoEvents } from "../../../../../data/gvteway";

export default function DirectionsPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const event = gvtewayDemoEvents.find((e) => e.id === eventId);

  if (!event) {
    return <Stack gap={4}><SectionHeader kicker="Directions" title="Event Not Found" colorScheme="on-dark" /></Stack>;
  }

  return (
    <Stack gap={8}>
      <SectionHeader kicker={event.name} title="Directions" description="Get directions to the venue" colorScheme="on-dark" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Car size={24} className="text-primary" />
              <Body className="font-weight-bold text-white">By Car</Body>
              <Body className="text-body-sm text-on-dark-muted">Driving directions and routes</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Train size={24} className="text-secondary" />
              <Body className="font-weight-bold text-white">Public Transit</Body>
              <Body className="text-body-sm text-on-dark-muted">Bus and train options</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Footprints size={24} className="text-accent" />
              <Body className="font-weight-bold text-white">Walking</Body>
              <Body className="text-body-sm text-on-dark-muted">Walking routes nearby</Body>
            </Stack>
          </CardBody>
        </Card>
      </div>
      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            <H3 className="text-white">Map</H3>
            <div className="flex h-64 items-center justify-center rounded border-2 border-ink-700 bg-ink-800">
              <Body className="text-on-dark-muted">Directions map will be displayed here</Body>
            </div>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
